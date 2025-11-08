import { Browser } from "puppeteer-core";
import { getSocialsFromPage } from "./getSocialMediaFormPage";
import { wait } from "./utils";
import { findEmailOnPage } from "./findEmailOnPage";
import { SocialLinks } from "@/types";

export async function FindEmailFormSite(
  browser: Browser,
  siteUrl: string
): Promise<{ email: string | null; socials: SocialLinks | null }> {
  // Normalize minimal url
  if (!siteUrl) return { email: null, socials: null };
  try {
    // ensure protocol
    if (!/^https?:\/\//i.test(siteUrl))
      siteUrl = "https://" + siteUrl.replace(/^\/\//, "");
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });

    const pagesToTry = [siteUrl];
    // Common contact/about paths (relative)
    const commonPaths = [
      "/",
    ];
    for (const p of commonPaths) {
      try {
        const url = new URL(siteUrl);
        pagesToTry.push(url.origin + p);
      } catch {
        // ignore invalid
      }
    }

    const MAX_TRIES = 4;
    let tries = 0;

    for (const u of pagesToTry) {
      if (tries++ >= MAX_TRIES) break;
      try {
        await page
          .goto(u, { waitUntil: "domcontentloaded", timeout: 10000 })
          .catch(() => {});

        await wait(2000);

        const socials = await getSocialsFromPage(page);
        const email = await findEmailOnPage(page);
        if (email) {
          await page.close();
          return { email, socials };
        }
      } catch (err) {
        console.log(err);
      }
    }

    await page.close();
    return { email: null, socials: null };
  } catch (err) {
    console.log("Error in tryVisitSiteForEmail:", err);
    return { email: null, socials: null };
  }
}
