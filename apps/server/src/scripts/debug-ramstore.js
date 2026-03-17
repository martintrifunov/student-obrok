import puppeteer from "puppeteer";

async function main() {
  console.log("[debug] Launching browser...");
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  console.log("[debug] Hitting Ramstore Vardar directly...");
  await page.goto("https://ramstore.com.mk/marketi/ramstore-vardar/", { waitUntil: "networkidle2" });
  
  await page.screenshot({ path: "ramstore_inner_debug.png", fullPage: true });

  const pageInfo = await page.evaluate(() => {
    const iframes = Array.from(document.querySelectorAll("iframe")).map(f => ({
      src: f.src,
      id: f.id,
      class: f.className
    }));
    
    const tables = Array.from(document.querySelectorAll("table")).map(t => t.rows.length);

    return { iframes, tableCounts: tables };
  });

  console.log("\n[debug] Inner Page Data:", JSON.stringify(pageInfo, null, 2));

  await browser.close();
}

main().catch(console.error);