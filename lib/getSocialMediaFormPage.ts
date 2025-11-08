import { Page } from "puppeteer-core";
import { extractSocialLinksFromHTML } from "./extractSocialLinksFormHTML";
import { SocialLinks } from "@/types";

 export async function getSocialsFromPage(page: Page): Promise<SocialLinks| null> {
  try {
    // 1) collect all anchor hrefs
    const hrefs: string[] = await page.$$eval("a[href]", (els) =>
      els.map((a) => (a as HTMLAnchorElement).href).filter(Boolean)
    );

    // 2) also collect possible social links from meta tags (og:url, twitter:site)
    const metaLinks: string[] = await page.$$eval(
      "meta[property], meta[name]",
      (els) =>
        els
          .map((m) => {
            const el = m as HTMLMetaElement;
            if (el.getAttribute("property")?.toLowerCase().includes("og:")) {
              return el.getAttribute("content");
            }
            if (el.getAttribute("name")?.toLowerCase().includes("twitter")) {
              return el.getAttribute("content");
            }
            return null;
          })
          .filter(Boolean) as string[]
    );

    const all = Array.from(new Set([...hrefs, ...metaLinks]));
    const socials = extractSocialLinksFromHTML(all);

    return socials || null;
    // If no social link found, return null to indicate none
    // const anyFound = Object.values(socials).some((v) => v && v > 0);
    // return anyFound ? socials : null;
  } catch (err) {
    console.log("Error extracting social links:", err);
    return null;
  }
}
