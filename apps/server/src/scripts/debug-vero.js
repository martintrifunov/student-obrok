import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(30_000);

  await page.goto("https://pricelist.vero.com.mk/", {
    waitUntil: "networkidle2",
  });

  const firstStoreUrl = await page.evaluate(() => {
    const storePattern = /^\d+_\d+\.html$/;
    const link = Array.from(document.querySelectorAll("a[href]")).find((a) =>
      storePattern.test(a.getAttribute("href")),
    );
    return link ? link.href : null;
  });

  console.log("[debug] First store URL:", firstStoreUrl);

  if (!firstStoreUrl) {
    console.error("[debug] No store link found on index page!");
    await browser.close();
    process.exit(1);
  }

  await page.goto(firstStoreUrl, { waitUntil: "networkidle2" });

  await page.screenshot({ path: "vero_store_debug.png", fullPage: true });
  console.log("[debug] Screenshot saved: vero_store_debug.png");

  const html = await page.content();
  fs.writeFileSync("vero_store_debug.html", html);
  console.log("[debug] HTML saved: vero_store_debug.html");

  const iframes = await page.evaluate(() =>
    Array.from(document.querySelectorAll("iframe")).map((f) => ({
      src: f.src,
      id: f.id,
      name: f.name,
      width: f.width,
      height: f.height,
    })),
  );
  console.log("[debug] Iframes found:", JSON.stringify(iframes, null, 2));

  const tables = await page.evaluate(() =>
    Array.from(document.querySelectorAll("table")).map((t, i) => ({
      index: i,
      rows: t.rows.length,
      firstRowHTML: t.rows[0]?.innerHTML.slice(0, 300),
    })),
  );
  console.log("[debug] Tables found:", JSON.stringify(tables, null, 2));

  const pageInfo = await page.evaluate(() => ({
    title: document.title,
    h1: Array.from(document.querySelectorAll("h1")).map((h) =>
      h.textContent.trim(),
    ),
    h2: Array.from(document.querySelectorAll("h2")).map((h) =>
      h.textContent.trim(),
    ),
    bodyTextPreview: document.body?.innerText.slice(0, 500),
  }));
  console.log("[debug] Page info:", JSON.stringify(pageInfo, null, 2));

  await browser.close();
  console.log("[debug] Done.");
}

main().catch((err) => {
  console.error("[debug] Fatal:", err);
  process.exit(1);
});
