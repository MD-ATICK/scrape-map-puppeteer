import { Page } from "puppeteer-core";
import { wait } from "./utils";

export async function loadAllMapResults(page: Page) {
  const {
    containerSelector,
    itemSelector,
    endTextSelector,
    busySelector,
    maxIdleRounds,
    scrollDelay,
    timeout,
  } = {
    containerSelector: ".m6QErb.DxyBCb", // main scroll container
    itemSelector: "div.Nv2PK", // result card
    endTextSelector: "div[aria-label*='end of the list']",
    busySelector: ".m6QErb[aria-busy='true']",
    maxIdleRounds: 3,
    scrollDelay: 400,
    timeout: 8000,
  };

  let previousHeight = 0;
  let idleRounds = 0;

  console.log("🚀 Starting scroll ...");

  while (idleRounds < maxIdleRounds) {
    // check if “end of list” visible
    const reachedEnd = await page.evaluate(
      (sel) => !!document.querySelector(sel),
      endTextSelector
    );
    if (reachedEnd) {
      console.log("✅ End of list detected.");
      break;
    }

    // scroll container down
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollBy(0, el.scrollHeight);
    }, containerSelector);

    // wait for spinner to finish (lazy loading)
    await page
      .waitForFunction(
        (sel) => !document.querySelector(sel),
        { timeout },
        busySelector
      )
      .catch(() => console.log("⚠️ Loading spinner timeout, continuing…"));

    await wait(scrollDelay);

    // check growth
    const currentHeight = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.scrollHeight : 0;
    }, containerSelector);

    if (currentHeight === previousHeight) idleRounds++;
    else idleRounds = 0;

    previousHeight = currentHeight;
    // eslint-disable-next-line
    const count = await page.$$eval(itemSelector, (els: any) => els.length);
    console.log(`📦 Loaded ${count} items so far…`);
  }

  console.log("🏁 Scrolling complete.");
  return true;
}