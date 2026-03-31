import { inflateSync } from "zlib";
import { BaseScraper } from "./base.scraper.js";

const INDEX_URL = "https://kam.com.mk/ceni-vo-marketi.nspx";
const SHOP_LIST_PATH = "/ShopsWeb/LoadShopList";
const PDF_BASE = "https://kam.com.mk/";
const MAX_PRICE = 840;
const FETCH_TIMEOUT_MS = 60_000;
const FETCH_RETRIES = 3;

// ─── Minimal PDF text extractor (no external dependencies) ───────────────────
// Handles: FlateDecode streams · ToUnicode CMaps (bfchar / bfrange) ·
//          Tm / Td / TD / T* positioning · Tj / TJ text operators

function tryInflate(buf) {
  try {
    return inflateSync(buf);
  } catch (_) {}
  try {
    return inflateSync(buf.slice(2));
  } catch (_) {}
  return null;
}

/** Parse a PDF literal-string body (contents between the outer parens). */
function parseLiteralBytes(raw) {
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    if (c === 0x5c) {
      // backslash
      i++;
      const n = raw.charCodeAt(i);
      if (n >= 0x30 && n <= 0x37) {
        // octal escape (up to 3 digits)
        let octal = raw[i];
        if (raw.charCodeAt(i + 1) >= 0x30 && raw.charCodeAt(i + 1) <= 0x37) {
          octal += raw[++i];
        }
        if (raw.charCodeAt(i + 1) >= 0x30 && raw.charCodeAt(i + 1) <= 0x37) {
          octal += raw[++i];
        }
        out.push(parseInt(octal, 8));
      } else if (n === 0x6e) out.push(0x0a);
      else if (n === 0x72) out.push(0x0d);
      else if (n === 0x74) out.push(0x09);
      else out.push(n);
    } else {
      out.push(c);
    }
  }
  return out;
}

/**
 * Parse all ToUnicode CMap streams.
 * Returns Map<cmapName, { keyLen: number, map: Map<hexStr, string> }>
 */
function parseCMaps(decompressedStreams) {
  const result = new Map();

  for (const text of decompressedStreams) {
    if (!text.includes("begincmap")) continue;

    const nameMatch = text.match(/\/CMapName\s+\/(\S+)/);
    if (!nameMatch) continue;
    const cmapName = nameMatch[1];

    const codeSpaceMatch = text.match(/begincodespacerange\s*<([0-9a-fA-F]+)>/);
    const keyLen = codeSpaceMatch ? codeSpaceMatch[1].length / 2 : 1;

    const charMap = new Map();

    // bfrange: <start> <end> <dstStart>
    for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
      for (const m of block[1].matchAll(
        /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g,
      )) {
        const start = parseInt(m[1], 16);
        const end = parseInt(m[2], 16);
        let dst = parseInt(m[3], 16);
        for (let code = start; code <= end; code++) {
          charMap.set(
            code.toString(16).padStart(keyLen * 2, "0"),
            String.fromCodePoint(dst++),
          );
        }
      }
    }

    if (charMap.size > 0) result.set(cmapName, { keyLen, map: charMap });
  }

  return result;
}

/**
 * Build a mapping of PDF font resource keys (e.g. "9", "a") to their CMap.
 * Links: /Font << /key N 0 R >> → N 0 obj /BaseFont /Name → CMap by name.
 */
function buildFontCMapIndex(rawPdfStr, cmaps) {
  const fontCMapIndex = new Map();

  const fontDictMatch = rawPdfStr.match(/\/Font\s*<<([^>]*)>>/);
  if (!fontDictMatch) return fontCMapIndex;

  const fontKeyToObj = new Map();
  for (const m of fontDictMatch[1].matchAll(/\/(\S+)\s+(\d+)\s+0\s+R/g)) {
    fontKeyToObj.set(m[1], parseInt(m[2]));
  }

  // Search each object by its exact position to avoid greedy-match overlap issues
  const objToBaseFont = new Map();
  for (const objNum of fontKeyToObj.values()) {
    const idx = rawPdfStr.indexOf(`\n${objNum} 0 obj`);
    if (idx === -1) continue;
    const slice = rawPdfStr.slice(idx, idx + 600);
    const bfm = slice.match(/\/BaseFont\s+\/(\S+)/);
    if (bfm) objToBaseFont.set(objNum, bfm[1]);
  }

  for (const [fontKey, objNum] of fontKeyToObj) {
    const baseFont = objToBaseFont.get(objNum);
    if (baseFont && cmaps.has(baseFont)) {
      fontCMapIndex.set(fontKey, cmaps.get(baseFont));
    }
  }

  return fontCMapIndex;
}

/** Decode byte array using a CMap with the given key length. */
function applyCharMap(bytes, charMap, keyLen) {
  let result = "";
  for (let i = 0; i < bytes.length; i += keyLen) {
    const hexKey = bytes
      .slice(i, i + keyLen)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    result += charMap.get(hexKey) ?? String.fromCharCode(bytes[i] ?? 0x3f);
  }
  return result;
}

/**
 * Parse a single decompressed content stream.
 * Returns [{str, x, y}] with absolute page coordinates.
 */
function parseContentItems(content, fontCMapIndex) {
  const items = [];
  const len = content.length;
  let i = 0;

  let x = 0, y = 0, lineX = 0, lineY = 0, leading = 0;
  let inBT = false;
  let currentCMap = null;
  let currentKeyLen = 1;
  const stack = [];

  function skipWS() {
    while (i < len && " \t\r\n\f".includes(content[i])) i++;
  }

  function readNumber() {
    let s = "";
    if (content[i] === "-" || content[i] === "+") s += content[i++];
    while (
      i < len &&
      (content[i] === "." || (content[i] >= "0" && content[i] <= "9"))
    )
      s += content[i++];
    return parseFloat(s);
  }

  function readLiteral() {
    i++; // skip '('
    let depth = 1,
      raw = "";
    while (i < len && depth > 0) {
      const ch = content[i];
      if (ch === "\\" && i + 1 < len) {
        raw += content[i] + content[i + 1];
        i += 2;
        continue;
      }
      if (ch === "(") depth++;
      else if (ch === ")") {
        if (--depth === 0) {
          i++;
          break;
        }
      }
      raw += ch;
      i++;
    }
    return parseLiteralBytes(raw);
  }

  function readHex() {
    i++; // skip '<'
    let hexStr = "";
    while (i < len && content[i] !== ">") {
      if (!" \t\r\n".includes(content[i])) hexStr += content[i];
      i++;
    }
    i++; // skip '>'
    if (hexStr.length % 2) hexStr += "0";
    const bytes = [];
    for (let j = 0; j < hexStr.length; j += 2)
      bytes.push(parseInt(hexStr.slice(j, j + 2), 16));
    return bytes;
  }

  function decodeBytes(bytes) {
    if (currentCMap) return applyCharMap(bytes, currentCMap, currentKeyLen);
    return bytes.map((b) => String.fromCharCode(b)).join("");
  }

  function readKeyword() {
    let kw = "";
    while (i < len && !/[\s\t\r\n\f()\[\]{}<>\/]/.test(content[i]))
      kw += content[i++];
    return kw;
  }

  while (i < len) {
    skipWS();
    if (i >= len) break;
    const ch = content[i];

    if (ch === "%") {
      while (i < len && content[i] !== "\n" && content[i] !== "\r") i++;
      continue;
    }

    if (ch === "/") {
      i++;
      let name = "";
      while (i < len && !/[\s\t\r\n\f()\[\]{}<>\/]/.test(content[i]))
        name += content[i++];
      stack.push({ type: "name", value: name });
      continue;
    }

    if (ch === "(") {
      stack.push({ type: "bytes", value: readLiteral() });
      continue;
    }

    if (ch === "<") {
      if (content[i + 1] === "<") {
        // Dictionary — skip to matching >>
        let depth = 0;
        while (i < len) {
          if (content[i] === "<" && content[i + 1] === "<") { depth++; i += 2; }
          else if (content[i] === ">" && content[i + 1] === ">") {
            depth--; i += 2;
            if (depth === 0) break;
          } else i++;
        }
        stack.push({ type: "dict" });
        continue;
      }
      stack.push({ type: "bytes", value: readHex() });
      continue;
    }

    if (ch === "[") {
      i++;
      const arr = [];
      while (i < len) {
        skipWS();
        if (content[i] === "]") { i++; break; }
        if (content[i] === "(") {
          arr.push({ type: "bytes", value: readLiteral() });
        } else if (content[i] === "<" && content[i + 1] !== "<") {
          arr.push({ type: "bytes", value: readHex() });
        } else if (
          content[i] === "-" || content[i] === "+" ||
          (content[i] >= "0" && content[i] <= "9") ||
          content[i] === "."
        ) {
          arr.push({ type: "num", value: readNumber() });
        } else { i++; }
      }
      stack.push({ type: "arr", value: arr });
      continue;
    }

    if (
      ch === "-" || ch === "+" ||
      (ch >= "0" && ch <= "9") ||
      (ch === "." && i + 1 < len && content[i + 1] >= "0" && content[i + 1] <= "9")
    ) {
      stack.push({ type: "num", value: readNumber() });
      continue;
    }

    if (/[A-Za-z*'"_]/.test(ch)) {
      const op = readKeyword();
      if (!inBT && op !== "BT") { stack.length = 0; continue; }

      switch (op) {
        case "BT":
          inBT = true; x = 0; y = 0; lineX = 0; lineY = 0;
          stack.length = 0; break;

        case "ET":
          inBT = false; stack.length = 0; break;

        case "Tf": {
          const names = stack.filter((t) => t.type === "name");
          if (names.length > 0) {
            const entry = fontCMapIndex.get(names[names.length - 1].value);
            if (entry) { currentCMap = entry.map; currentKeyLen = entry.keyLen; }
            else { currentCMap = null; currentKeyLen = 1; }
          }
          stack.length = 0; break;
        }

        case "Tm": {
          const nums = stack.filter((t) => t.type === "num");
          if (nums.length >= 6) {
            x = nums[nums.length - 2].value;
            y = nums[nums.length - 1].value;
            lineX = x; lineY = y;
          }
          stack.length = 0; break;
        }

        case "Td": case "TD": {
          const nums = stack.filter((t) => t.type === "num");
          if (nums.length >= 2) {
            x = lineX + nums[nums.length - 2].value;
            y = lineY + nums[nums.length - 1].value;
            lineX = x; lineY = y;
            if (op === "TD") leading = -nums[nums.length - 1].value;
          }
          stack.length = 0; break;
        }

        case "T*":
          y = lineY - leading; lineY = y;
          stack.length = 0; break;

        case "TL": {
          const nums = stack.filter((t) => t.type === "num");
          if (nums.length) leading = nums[nums.length - 1].value;
          stack.length = 0; break;
        }

        case "Tj": {
          const top = stack[stack.length - 1];
          if (top?.type === "bytes") {
            const str = decodeBytes(top.value).replace(/\s+/g, " ").trim();
            if (str) items.push({ str, x, y });
          }
          stack.length = 0; break;
        }

        case "'": case '"': {
          y = lineY - leading; lineY = y;
          const top = stack[stack.length - 1];
          if (top?.type === "bytes") {
            const str = decodeBytes(top.value).replace(/\s+/g, " ").trim();
            if (str) items.push({ str, x, y });
          }
          stack.length = 0; break;
        }

        case "TJ": {
          const top = stack[stack.length - 1];
          if (top?.type === "arr") {
            const str = top.value
              .filter((t) => t.type === "bytes")
              .map((t) => decodeBytes(t.value))
              .join("")
              .replace(/\s+/g, " ")
              .trim();
            if (str) items.push({ str, x, y });
          }
          stack.length = 0; break;
        }

        default:
          stack.length = 0; break;
      }
      continue;
    }

    i++;
  }

  return items;
}

/**
 * Extract all text items with page coordinates from a PDF buffer.
 * Returns [{str, x, y, page}]
 */
function extractPdfTextItems(pdfBuffer) {
  const pdf = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
  const rawPdfStr = pdf.toString("latin1");

  // Step 1: decompress all FlateDecode streams
  const decompressedStreams = [];
  let pos = 0;

  while (pos < pdf.length) {
    const streamKeyword = pdf.indexOf(Buffer.from("stream"), pos);
    if (streamKeyword === -1) break;

    let dataStart = streamKeyword + 6;
    if (pdf[dataStart] === 0x0d && pdf[dataStart + 1] === 0x0a) dataStart += 2;
    else if (pdf[dataStart] === 0x0a) dataStart += 1;
    else { pos = streamKeyword + 1; continue; }

    const endStream = pdf.indexOf(Buffer.from("endstream"), dataStart);
    if (endStream === -1) break;

    const header = pdf
      .slice(Math.max(0, streamKeyword - 512), streamKeyword)
      .toString("latin1");
    const isFlate =
      /\/Filter\s*\/FlateDecode/.test(header) ||
      /\/Filter\s*\[.*\/FlateDecode/.test(header);

    if (isFlate) {
      let raw = pdf.slice(dataStart, endStream);
      while (
        raw.length > 0 &&
        (raw[raw.length - 1] === 0x0a || raw[raw.length - 1] === 0x0d)
      ) {
        raw = raw.slice(0, -1);
      }
      const decoded = tryInflate(raw);
      if (decoded) decompressedStreams.push(decoded.toString("latin1"));
    }

    pos = endStream + 9;
  }

  // Step 2: parse CMaps
  const cmaps = parseCMaps(decompressedStreams);

  // Step 3: build fontKey → CMap index
  const fontCMapIndex = buildFontCMapIndex(rawPdfStr, cmaps);

  // Step 4: parse content streams
  const allItems = [];
  let pageNum = 0;

  for (const streamText of decompressedStreams) {
    if (!streamText.includes("BT")) continue;
    if (!streamText.includes("Tj") && !streamText.includes("TJ")) continue;
    if (streamText.includes("begincmap")) continue;

    pageNum++;
    const items = parseContentItems(streamText, fontCMapIndex);
    allItems.push(...items.map((it) => ({ ...it, page: pageNum })));
  }

  return allItems;
}

export class KamScraper extends BaseScraper {
  get chainName() {
    return "KAM";
  }

  get placeholderImageFilename() {
    return process.env.CHAIN_IMAGE_KAM || "kam_market.png";
  }

  get geocodeSuffix() {
    return "Македонија";
  }

  async fetchMarkets(page) {
    // Navigate to trigger session cookies, then call the JSON API
    await page.goto(INDEX_URL, { waitUntil: "networkidle2" });

    const shops = await page.evaluate(async (apiPath) => {
      const res = await fetch(apiPath, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json, text/plain, */*",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      if (!res.ok) return [];

      const body = await res.text();
      try {
        const parsed = JSON.parse(body);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }, SHOP_LIST_PATH);

    const seen = new Set();
    const markets = [];

    for (const shop of shops) {
      if (!shop.ShopFiles?.length) continue;

      const name = `КАМ ${shop.Name}`.trim();
      if (seen.has(name)) continue;
      seen.add(name);

      markets.push({
        name,
        address: [shop.Address, shop.City].filter(Boolean).join(", "),
        pricelistUrl: `${PDF_BASE}${shop.ShopFiles[0].RelativePath}`,
      });
    }

    return markets;
  }

  async #fetchPdf(url) {
    for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return Buffer.from(await res.arrayBuffer());
      } catch (err) {
        if (attempt < FETCH_RETRIES) {
          console.warn(
            `[KamScraper] PDF fetch attempt ${attempt}/${FETCH_RETRIES} failed: ${err.message}. Retrying...`,
          );
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        } else {
          throw err;
        }
      }
    }
  }

  async fetchProducts(_page, pdfUrl, prevUpdateDate) {
    const pdfBuf = await this.#fetchPdf(pdfUrl);
    const items = extractPdfTextItems(pdfBuf);

    if (!items.length) {
      console.warn(`[KamScraper] No text items extracted from ${pdfUrl}`);
      return { upToDate: false, products: [] };
    }

    // Extract update date string from first-page text
    const firstPageText = items
      .filter((it) => it.page === 1)
      .map((it) => it.str)
      .join(" ");

    const updateMatch = firstPageText.match(
      /(\d{1,2}[./]\d{1,2}[./]\d{4}\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i,
    );
    const newUpdateDate = this.parseUpdateDate(updateMatch?.[1] ?? null);

    if (
      prevUpdateDate &&
      newUpdateDate &&
      prevUpdateDate.getTime() === newUpdateDate.getTime()
    ) {
      return { upToDate: true };
    }

    const products = this.#parseProducts(items);
    return { upToDate: false, products, newUpdateDate };
  }

  #parseProducts(items) {
    const byPage = new Map();
    for (const it of items) {
      if (!byPage.has(it.page)) byPage.set(it.page, []);
      byPage.get(it.page).push(it);
    }

    const products = [];
    let colBounds = null;

    for (const [, pageItems] of byPage) {
      if (!colBounds) colBounds = this.#detectColumns(pageItems);
      if (!colBounds) continue;

      const rows = this.#groupRows(pageItems);
      for (const row of rows) {
        const product = this.#parseRow(row, colBounds);
        if (product) products.push(product);
      }
    }

    return products;
  }

  #detectColumns(items) {
    const headers = [
      { key: "title", pattern: /назив|производ/i },
      { key: "price", pattern: /^продажна$/i },
      { key: "unitPrice", pattern: /^единична$/i },
      { key: "category", pattern: /^опис$/i },
      { key: "availability", pattern: /достапност/i },
    ];

    const xByKey = {};
    for (const { key, pattern } of headers) {
      const match = items.find((it) => pattern.test(it.str));
      if (match) xByKey[key] = match.x;
    }

    if (!xByKey.title || !xByKey.price || !xByKey.availability) return null;

    const sorted = Object.entries(xByKey).sort((a, b) => a[1] - b[1]);
    const ranges = {};
    for (let i = 0; i < sorted.length; i++) {
      const [key, startX] = sorted[i];
      ranges[key] = { startX, endX: i < sorted.length - 1 ? sorted[i + 1][1] : Infinity };
    }
    return ranges;
  }

  #groupRows(items) {
    if (!items.length) return [];
    const sorted = [...items].sort((a, b) => {
      const dy = b.y - a.y;
      if (Math.abs(dy) > 3) return dy;
      return a.x - b.x;
    });

    const rows = [[sorted[0]]];
    let rowY = sorted[0].y;
    for (let i = 1; i < sorted.length; i++) {
      if (Math.abs(sorted[i].y - rowY) <= 3) {
        rows[rows.length - 1].push(sorted[i]);
      } else {
        rows.push([sorted[i]]);
        rowY = sorted[i].y;
      }
    }
    return rows;
  }

  #parseRow(rowItems, cols) {
    const sorted = [...rowItems].sort((a, b) => a.x - b.x);

    const collect = (key) =>
      sorted
        .filter((it) => cols[key] && it.x >= cols[key].startX && it.x < cols[key].endX)
        .map((it) => it.str)
        .join(" ")
        .trim();

    const title = collect("title");
    if (!title || title.length < 2) return null;
    if (/назив|производ|стока/i.test(title)) return null;

    const availText = collect("availability").toUpperCase();
    if (availText === "НЕ") return null;

    const rawPrice = collect("price").replace(",", ".").replace(/[^\d.]/g, "");
    const price = parseFloat(rawPrice);
    if (isNaN(price) || price <= 0 || price > MAX_PRICE) return null;

    const category = collect("category") || "Општо";
    return { title, price, category };
  }
}
