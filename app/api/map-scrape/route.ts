import { GOOGLE_MAP_BASE_URL, wait } from "@/lib/utils";
import { ScrapeResult } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { Page } from "puppeteer";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const scrapedData: ScrapeResult[] = [];
let count = 1;
const phoneRegex =
  /(\+?\d{1,4}[\s-]?)?(\(?\d{2,5}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g;

import { findPhoneNumbersInText } from "libphonenumber-js";

// eslint-disable-next-line
export function extractPhonesFromJSON(raw: any) {
  // Step 1: stringify once — scans the entire nested structure
  const text = JSON.stringify(raw);

  // Step 2: extract all phones globally (auto-detects country)
  const results = findPhoneNumbersInText(text);

  // Step 3: normalize & deduplicate
  const unique = new Set();
  for (const r of results) {
    unique.add(r.number.number); // standardized +E.164 format
  }

  return [...unique];
}

function extractEmailsAndSocials(html: string) {
  const $ = cheerio.load(html);
  // emails (simple)
  const emails = new Set(
    html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi) || []
  );

  // socials
  const socials: string[] = [];
  $("a[href]").each((i, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    if (href.includes("facebook.com")) socials.push("facebook");
    if (href.includes("twitter.com")) socials.push("twitter");
    if (href.includes("linkedin.com")) socials.push("linkedin");
  });
  return { emails: [...emails], socials: [...new Set(socials)] };
}

// eslint-disable-next-line
function parsePlacePreview(raw: any, count: number): ScrapeResult {
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

  return {
    scrapeNo: count,
    name,
    address,
    website,
    rating,
    reviewsCount,
  };
}

async function placeRequestHandle(page: Page) {
  await page.setRequestInterception(true);

  page.on("request", (req) => {
    req.continue();
  });

  const x = page.on("response", async (req) => {
    const url = req.url();
    if (url.includes("/maps/preview/place")) {
      const text = await req.text();
      if (text.startsWith(")]}'")) {
        const json = JSON.parse(text.slice(4));
        const phoneNumbers = extractPhonesFromJSON(json);
        const data = parsePlacePreview(json, count);
        count++;
        if (!data.website) {
          scrapedData.push({
            ...data,
            phone: phoneNumbers[0] as string | null,
          });
          return;
        }
        const res = await axios.get(data.website, {
          timeout: 15000,
          headers: {
            Accept: "text/html,application/xhtml+xml",
          },
          responseType: "text",
        });

        const { emails, socials } = extractEmailsAndSocials(res.data);
        scrapedData.push({
          ...data,
          email: emails[0],
          phone: phoneNumbers[0] as string | null,
        });
      }
    }
  });
  return x;
}

export async function POST(req: NextRequest) {
  const { search, location, maxScrape } = await req.json();

  if (!search || !location || !maxScrape)
    return NextResponse.json(
      { error: "Missing search or location" },
      { status: 400 }
    );

  count = 0;
  scrapedData.length = 0;

  // const browser = await puppeteer.launch({
  //   headless: false,
  //   args: ["--start-maximized"],
  // });
  const browser = await puppeteerCore.launch({
    headless: false,
    args: chromium.args,
    // executablePath : "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar"
    executablePath: await chromium.executablePath(),
  });
  const page = await browser.newPage();

  await placeRequestHandle(page);

  await page.setViewport({ width: 1100, height: 950 });
  await page.goto(
    `${GOOGLE_MAP_BASE_URL}/${encodeURIComponent(
      search
    )} in ${encodeURIComponent(location)}?hl=en`,
    { waitUntil: "networkidle2" }
  );

  for (let i = 0; i < Number(maxScrape); i++) {
    console.log("ITEM", i);
    const items = await page.$$("div.Nv2PK");
    const item = items[i];

    if (!item) await wait(3000);

    if (item) {
      await item.evaluate((el) => el.scrollIntoView({ block: "center" }));
      await item.click();
    }
  }

  await wait(10000);
  await browser.close();
  return NextResponse.json({ total: scrapedData.length, data: scrapedData });
}
