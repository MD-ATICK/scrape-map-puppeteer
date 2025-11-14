import { GOOGLE_MAP_BASE_URL, wait } from "@/lib/utils";
import { ScrapeResultType } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Page } from "puppeteer";
import axios from "axios";
import { extractPhonesFromJSON } from "@/lib/extract-phone-form-json";
import { parsingBasicDetails } from "@/lib/parsing-basic-details";
import * as cheerio from "cheerio";
import { findEmailFromHtml } from "@/lib/find-email-form-html";

const scrapedData: ScrapeResultType[] = [];
let count = 1;

const fetchHtmlData = async (url: string) => {
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
      responseType: "text",
    });

    return res.data;
  } catch (error) {
    console.log(url, (error as Error).message);
  }
};

async function getSocialsFromPage(html: string) {
  if (!html) return {
    facebookUrl: null,
    instagramUrl: null,
    linkedinUrl: null,
    tiktokUrl: null,
  };
  const $ = cheerio.load(html);

  const facebookUrl = $('a[href*="facebook.com"]').attr("href") || null;
  const instagramUrl = $('a[href*="instagram.com"]').attr("href") || null;
  const linkedinUrl = $('a[href*="linkedin.com"]').attr("href") || null;
  const tiktokUrl = $('a[href*="tiktok.com"]').attr("href") || null;

  return {
    facebookUrl,
    instagramUrl,
    linkedinUrl,
    tiktokUrl,
  };
}

async function placeRequestHandle(page: Page) {
  await page.setRequestInterception(true);

  page.on("request", (req) => {
    req.continue();
  });

  const x = page.on("response", async (req) => {
    if (req.url().includes("/maps/preview/place")) {
      const text = await req.text();

      if (text.startsWith(")]}'")) {
        const json = JSON.parse(text.slice(4));
        const phoneNumbers = extractPhonesFromJSON(JSON.stringify(json));
        const data = parsingBasicDetails(json, count);
        const date = new Date();
        count++;

        if (!data.website) {
          scrapedData.push({
            ...data,
            phone: phoneNumbers[0] as string | null,
            lead_scraped_at: date,
          });
          return;
        }

        const html = await fetchHtmlData(data.website);

        const email = findEmailFromHtml(html);
        const response = await fetch("http://localhost:3000/api/email-verify", {
          method: "POST",
          body: JSON.stringify({ email }),
          cache: "no-store",
        });
        const verifiedData = await response.json();
        const socials = await getSocialsFromPage(html);

        scrapedData.push({
          ...data,
          email,
          phone: phoneNumbers[0] as string | null,
          facebookUrl: socials.facebookUrl,
          status_code: verifiedData.code,
          email_status: verifiedData.message,
          instagramUrl: socials.instagramUrl,
          linkedinUrl: socials.linkedinUrl,
          tiktokUrl: socials.tiktokUrl,
          lead_scraped_at: date,
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

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"],
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
    const items = await page.$$("div.Nv2PK");
    const item = items[i];

    if (!item) {
      const reachedMaxElement = await page.$("div.PbZDve");

      if (reachedMaxElement) {
        await browser.close();
        return NextResponse.json({
          total: scrapedData.length,
          data: scrapedData,
        });
      }
      await wait(2000);
    }

    if (item) {
      await item.evaluate((el) => el.scrollIntoView({ block: "center" }));
      await item.click();
      await wait(1000);
    }
  }

  await wait(3000);
  await browser.close();
  return NextResponse.json({ total: scrapedData.length, data: scrapedData });
}
