import { wait } from "@/lib/utils";
import { ScrapeResult } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

export async function POST(req: NextRequest) {
  const { search, location, maxScrape } = await req.json();

  if (!search || !location || !maxScrape) {
    return NextResponse.json(
      { error: "Missing search or location" },
      { status: 400 }
    );
  }

  const url = `https://www.google.com/maps/search/${encodeURIComponent(
    search
  )}+in+${encodeURIComponent(location)}?hl=en`;

  const browser = await chromium.launch({
    headless: false,
    args: [
      "--start-maximized",
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--lang=en-US",
    ],
  });

  const context = await browser.newContext({
    locale: "en-US",
    viewport: { width: 1000, height: 950 },
  });

  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Wait for initial results
  const itemSelector = "div.Nv2PK";
  await page.waitForSelector(itemSelector, { timeout: 30000 });

  const results: ScrapeResult[] = [];

  for (let i = 0; i < Number(maxScrape); i++) {
    const items = page.locator(itemSelector);

    const item = items.nth(i);

    if (!item) {
      console.log("Waiting 5sec for more items to load...");
      await wait(3000);
    }

    if (item) {
      try {
        console.error("WORKED", i, JSON.stringify(item));
        // Scroll this item into view — TOP of list
        await item.evaluate((el) => {
          el.scrollIntoView({ block: "start", behavior: "instant" });
        });
        await item.click();
        await wait(200);
        await item.click();
        // Record previous name (to detect refresh)
        const prevName = await page
          .locator("h1.DUwDvf")
          .textContent()
          .catch(() => null);

        // Wait for panel to update (name changes)
        await page.waitForFunction(
          (prev) => {
            const el = document.querySelector("h1.DUwDvf");
            return (
              el &&
              el.textContent &&
              el.textContent.trim() !== prev &&
              !document.querySelector(".m6QErb[aria-busy='true']")
            );
          },
          prevName,
          { timeout: 500 }
        );

        // Extract data
        const data = await page.evaluate(() => {
          const name =
            document.querySelector("h1.DUwDvf")?.textContent?.trim() || null;
          const address =
            document
              .querySelector("button[data-item-id='address'] div")
              ?.textContent?.trim()
              ?.replace(/^\s*·\s*/, "") ?? null;
          const phone =
            document
              .querySelector("button[data-item-id*='phone'] div")
              ?.textContent?.trim()
              ?.replace(/^\s*·\s*/, "") || null;
          const rating =
            document.querySelector("span.ceNzKf")?.textContent?.trim() || null;
          const reviews =
            document.querySelector("span[aria-label*='review']")?.textContent ||
            null;
          const category =
            document
              .querySelector("button[jsaction*='category']")
              ?.textContent?.trim() || null;
          const businessType =
            document
              .querySelector("div[aria-label*='Type of business']")
              ?.textContent?.trim() || null;
          const openingHours =
            document
              .querySelector("div[aria-label*='Open']")
              ?.textContent?.trim() || null;

          const websiteLink = Array.from(document.querySelectorAll("a"))
            .map((a) => a.getAttribute("href"))
            .find(
              (href) =>
                href && href.startsWith("http") && !href.includes("google")
            );

          return {
            name,
            address,
            phone,
            website: websiteLink || "",
            rating,
            reviews,
            category,
            businessType,
            openingHours,
          };
        });

        results.push({ ...data, scrapeNo: i + 1 } as ScrapeResult);
        // // Skip duplicates (panel didn’t change)
        // const last = results[results.length - 1];
        // if (!last || last.name !== data.name) {
        //   results.push({ ...data, scrapeNo: i + 1 } as ScrapeResult);
        //   console.log(`✅ Scraped #${i + 1}: ${data.name}`);
        // } else {
        //   console.log(`⚠️ Duplicate panel skipped: ${data.name}`);
        // }
      } catch (err) {
        console.error(
          "ERROR OR TIMEOUT",
          i,
          JSON.stringify(item),
          (err as Error).message
        );
        continue;
      }
    }
  }

  await browser.close();
  return NextResponse.json({ total: results.length, data: results });
}
