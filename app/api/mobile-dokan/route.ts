import { wait } from "@/lib/utils";
import puppeteer, { Page } from "puppeteer";

export async function POST() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=en-US"],
  });

  const page = await browser.newPage();
  await page.goto("https://www.mobiledokan.co/products/", {
    waitUntil: "domcontentloaded",
  });

  page.setViewport({ width: 1200, height: 800 });

  // Get all product links
  const productLinks = await page.$$eval("ul.aps-products li .aps-product-title a", (anchors) =>
    anchors.map((a) => a.href)
  );

  console.log(`🧩 Found ${productLinks.length} products`);

  const results = [];

  for (let i = 0; i < productLinks.length; i++) {
    const link = productLinks[i];
    console.log(`📱 Scraping product ${i + 1}/${productLinks.length}: ${link}`);

    try {
      await page.goto(link, { waitUntil: "domcontentloaded" });

      await wait(1000);
      const product = await page.evaluate(() => {
        const name = document.querySelector("h1.entry-title")?.textContent?.trim();
        const price =
          document.querySelector(".aps-price-value")?.textContent?.trim() ||
          document.querySelector(".woocommerce-Price-amount")?.textContent?.trim() ||
          "N/A";

        const specs : { [key: string]: string } = {};
        document.querySelectorAll(".aps-single-product-specs ul li").forEach((li) => {
          const label = li.querySelector("strong")?.textContent?.replace(":", "").trim();
          const value = li.childNodes[1]?.textContent?.trim();
          if (label && value)  specs[label] = value;
        });

        const image = (document.querySelector(".aps-product-image img") as HTMLImageElement)?.src;

        return { name, price, specs, image, url: window.location.href };
      });

      results.push(product);
      await page.goBack({ waitUntil: "domcontentloaded" });
    } catch (err) {
      console.error(`❌ Error scraping ${link}:`, err);
      continue;
    }
  }

  await browser.close();

  console.log("✅ Scraping completed:", results);
  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}

