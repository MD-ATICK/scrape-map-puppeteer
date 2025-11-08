import puppeteer from "puppeteer";
import axios from "axios";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST() {
 
  const res = await axios.get("https://www.mobiledokan.co/", {
    timeout: 15000,
    headers: {
      "User-Agent": "YourBot/1.0 (+https://yourdomain.example)",
      Accept: "text/html,application/xhtml+xml",
    },
    responseType: "text",
  });
 const data = extractEmailsAndSocials(res.data);
  console.log(data);

  return NextResponse.json({ total: 0, data: [] });

  // const browser = await puppeteer.launch({
  //   headless: false,
  //   args: [j
  //     "--start-maximized",
  //     "--disable-setuid-sandbox",
  //     "--no-sandbox",
  //     "--lang=en-US",
  //   ],
  // });
  // // ,  "--force-device-scale-factor=0.3"
  // const page = await browser.newPage();
  // await page.setViewport({ width: 1100, height: 950 });
  // await page.goto("https://www.mobiledokan.co/products/", {
  //   waitUntil: "networkidle2",
  // });

  // for (let i = 0; i < 5; i++) {
  //   console.log("ITEM", i);
  //   const items = await page.$$("ul.aps-products");
  //   const item = items[i];

  //   if (item) {
  //     await item.click();
  //   }
  // }
}


function extractEmailsAndSocials(html : string) {
  const $ = cheerio.load(html);
  // emails (simple)
  const emails = new Set((html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi) || []));
  // socials
  const socials : string[] = [];
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    if (href.includes('facebook.com')) socials.push('facebook');
    if (href.includes('twitter.com')) socials.push('twitter');
    if (href.includes('linkedin.com')) socials.push('linkedin');
  });
  return { emails: [...emails], socials: [...new Set(socials)] };
}