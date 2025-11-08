import { Page } from "puppeteer-core";
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}/g;

export async function findEmailOnPage(page: Page) {
  const mailto = await page.$$eval("a[href^='mailto:']", (els) =>
    els.map((a) => (a as HTMLAnchorElement).getAttribute("href"))
  );

  for (const m of mailto) {
    if (!m) continue;
    const maybe = m.replace(/^mailto:/i, "").split("?")[0];
    if (EMAIL_REGEX.test(maybe)) return maybe;
  }

  const html = await page.content();
  const textMatches = html.match(EMAIL_REGEX);
  if (textMatches && textMatches.length) {
    for (const em of textMatches) {
      if (!em.includes("example.com") && !em.includes("google")) return em;
    }
    return textMatches[0];
  }

  return null;
}
