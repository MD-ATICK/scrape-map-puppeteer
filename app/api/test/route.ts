// app/api/scrape/route.ts
import { wait } from "@/lib/utils";
import { ScrapeResult } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Page } from "puppeteer";
export function extractNameFromPreview(json: any) {
  const info = json?.[6];
  if (!Array.isArray(info)) return null;

  // Look for a string that seems like a business name
  const candidates = [info[11], info[12], info[13], info[14]].filter(
    (v) => typeof v === "string" && v.trim().length > 0
  );

  // Use the first strong candidate
  if (candidates.length > 0) return candidates[0];

  // Fallback: find the first string with spaces & title-case
  const guess = info.find(
    (v: any) =>
      typeof v === "string" &&
      v.length > 5 &&
      /[A-Z]/.test(v[0]) &&
      v.includes(" ")
  );
  return guess || null;
}

// // eslint-disable-next-line
// export function parsePlacePreview(raw: any, count: number): ScrapeResult {
//   const info = raw?.[6] ?? [];

//   const addressArray = info?.[2];
//   const ratingBlock = info?.[4];
//   const websiteBlock = info?.[7];

//   const name =
//     typeof info?.[12] === "string"
//       ? info[12]
//       : typeof info?.[11] === "string"
//       ? info[11]
//       : null;

//   const address = Array.isArray(addressArray)
//     ? addressArray.filter(Boolean).join(", ")
//     : null;

//   const website =
//     Array.isArray(websiteBlock) && typeof websiteBlock[0] === "string"
//       ? websiteBlock[0]
//       : null;

//   const rating =
//     Array.isArray(ratingBlock) && typeof ratingBlock[7] === "number"
//       ? ratingBlock[7].toString()
//       : null;

//   const reviewsCount =
//     Array.isArray(ratingBlock) && typeof ratingBlock[8] === "number"
//       ? ratingBlock[8].toString()
//       : null;

//   const categoryArray = info?.[14] ?? info?.[13] ?? info?.[15] ?? info?.[16];
//   const category = Array.isArray(categoryArray)
//     ? categoryArray.join(", ")
//     : null;

//   const typeOfBusiness =
//     typeof info?.[15] === "string"
//       ? info[15]
//       : typeof info?.[16] === "string"
//       ? info[16]
//       : Array.isArray(info?.[15])
//       ? info[15].join(", ")
//       : null;

//   const openingHours =
//     Array.isArray(info?.[48]?.[0]) && info[48][0].length
//       ? info[48][0].join(", ")
//       : null;

//   const phone =
//     typeof info?.[17] === "string"
//       ? info[17]
//       : Array.isArray(info?.[17]) && typeof info[17][0] === "string"
//       ? info[17][0]
//       : Array.isArray(info?.[65]) && typeof info[65]?.[0]?.[2] === "string"
//       ? info[65][0][2]
//       : null;

//   return {
//     scrapeNo: count,
//     name,
//     address,
//     phone, // sometimes missing in preview
//     website,
//     rating,
//     reviewsCount,
//     category,
//     typeOfBusiness,
//     openingHours,
//   };
// }


export function parsePlacePreview(raw : any, count : number) : ScrapeResult {
  const info = raw?.[6] ?? [];

  const addressArray = info?.[2];
  const ratingBlock = info?.[4];
  const websiteBlock = info?.[7];

  const name =
    typeof info?.[12] === "string"
      ? info[12]
      : typeof info?.[11] === "string"
      ? info[11]
      : null;

  const address = Array.isArray(addressArray)
    ? addressArray.filter(Boolean).join(", ")
    : null;

  const website =
    Array.isArray(websiteBlock) && typeof websiteBlock[0] === "string"
      ? websiteBlock[0]
      : null;

  const rating =
    Array.isArray(ratingBlock) && typeof ratingBlock[7] === "number"
      ? ratingBlock[7].toString()
      : null;

  const reviewsCount =
    Array.isArray(ratingBlock) && typeof ratingBlock[8] === "number"
      ? ratingBlock[8].toString()
      : null;

  // 🔧 Phone: multiple fallback indexes
  const phone =
    typeof info?.[17] === "string"
      ? info[17]
      : Array.isArray(info?.[17]) && typeof info[17][0] === "string"
      ? info[17][0]
      : Array.isArray(info?.[65]) && typeof info[65]?.[0]?.[2] === "string"
      ? info[65][0][2]
      : Array.isArray(info?.[183]) && typeof info[183]?.[0]?.[3] === "string"
      ? info[183][0][3]
      : null;


  return {
    scrapeNo: count,
    name,
    address,
    phone,
    website,
    rating,
    reviewsCount,
  };
}


export async function interceptPlacePreview(page: Page) {
  // 1️⃣ Intercept network requests
  await page.setRequestInterception(true);

  let placeResponse: any = null;

  page.on("request", (req) => {
    // Allow all requests through (we’re only listening)
    req.continue();
  });

  page.on("response", async (res) => {
    const url = res.url();

    // 2️⃣ Detect "preview/place" requests
    if (url.includes("/maps/preview/place")) {
      try {
        const text = await res.text();

        if (text.startsWith(")]}'")) {
          // Remove XSSI prefix
          const json = JSON.parse(text.slice(4));
          placeResponse = json;
          const parseData = parsePlacePreview(json, 0);
          console.log("📝 Parsed place preview data:", parseData);
        }
      } catch (e) {
        console.warn("Failed to parse preview response", (e as Error).message);
      }
    }
  });

  return () => placeResponse; // returns accessor function
}
export async function POST(req: NextRequest) {
  const { search, location, maxScrape } = await req.json();

  if (!search || !location || !maxScrape)
    return NextResponse.json(
      { error: "Missing search or location" },
      { status: 400 }
    );

  const url = `https://www.google.com/maps/search/${encodeURIComponent(
    search
  )}?hl=en`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        "--start-maximized",
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--lang=en-US",
      ],
    });
    // ,  "--force-device-scale-factor=0.3"
    const page = await browser.newPage();
    const getPlaceData = await interceptPlacePreview(page);

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.setViewport({ width: 1100, height: 950 });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await page.evaluate(() => {
      localStorage.clear();
    });

    // LEFT LIST ITEMS (Google Maps Results)
    const itemSelector = "div.Nv2PK"; // Current Google Maps card selector
    await page.waitForSelector(itemSelector, { timeout: 20000 });

    // await loadAllMapResults(page);

    // return;

    const results: ScrapeResult[] = [];

    for (let i = 0; i < Number(maxScrape); i++) {
      const items = await page.$$("div.Nv2PK");
      const item = items[i];
      // console.log("ITEM", i, item, "ITEMS COUNT", items.length);
      try {
        // console.log("SAFE NO" + i + JSON.stringify(item));

        if (!item) {
          // FOR LOAD NEXT ITEMS
          await wait(3000);
        }

        if (item) {
          const prevName = await page
            .$eval("h1.DUwDvf", (el) => el.textContent)
            .catch(() => null);

          await page.evaluate((el) => {
            el.scrollIntoView({ block: "center" });
          }, item);

          await item.click();
          // Retrieve captured data
          const resultData = getPlaceData();
          if (resultData) {
            console.log(
              "Extracted place data keys:",
              Object.keys(resultData[0][4][0])
            );
          }

          await page.waitForFunction(
            (prev) => {
              const nameEl = document.querySelector("h1.DUwDvf");
              return (
                nameEl &&
                nameEl.textContent !== prev &&
                !document.querySelector(".m6QErb[aria-busy='true']")
              );
            },
            { timeout: 2000 },
            prevName
          );

          // Wait for Detail Panel
          await page.waitForSelector("h1.DUwDvf", { timeout: 6000 });

          const data = await page.evaluate(() => {
            const name =
              document.querySelector("h1.DUwDvf")?.textContent || null;
            const address =
              document
                .querySelector("button[data-item-id='address'] div")
                ?.textContent.slice(1) ?? null;
            const phone =
              document
                .querySelector("button[data-item-id*='phone'] div")
                ?.textContent.slice(1) || null;

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
            };
          });

          // const extraScrapeData = await tryVisitSiteForEmail(
          // 	browser,
          // 	data.website || "",
          // );

          // console.log(i + 1, "Succeed");
          results.push({ ...data, scrapeNo: i + 1 } as ScrapeResult);
        }
      } catch (err) {
        console.log("NO" + i + JSON.stringify(item));
        continue;
      }
    }

    await browser.close();

    return NextResponse.json({ total: results.length, data: results });
  } catch (error) {
    console.log((error as Error).message);
    if (browser) await browser.close();
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
