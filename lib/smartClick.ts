import { ElementHandle, Page } from "puppeteer-core";
import { wait } from "./utils";

export async function smartClick(
  page: Page,
  item: ElementHandle,
  index: number
) {
  try {
    // 1️⃣ আগে নিশ্চিত হও element এখনো DOM-এ আছে
    const isAttached = await page.evaluate((el) => document.contains(el), item);
    if (!isAttached) {
      console.warn(`❌ Item #${index} detached, skipping`);
      return false;
    }

    // 2️⃣ Panel pre-state ধরে রাখো (আগের নাম)
    const prevName = await page
      .$eval("h1.DUwDvf", (el) => el.textContent.trim())
      .catch(() => null);

    // 3️⃣ Click করার আগে scroll into view
    await page.evaluate((el) => {
      el.scrollIntoView({ block: "center" });
    }, item);

    // 4️⃣ Native mouse click (event dispatch নিশ্চিত করতে)
    const box = await item.boundingBox();
    if (!box) return false;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await wait(50);
    await page.mouse.up();

    // 5️⃣ Frame event listener attach করো (panel recreate শনাক্ত করতে)
    let frameChanged = false;
    const onFrameNav = () => (frameChanged = true);
    page.on("framenavigated", onFrameNav);

    // 6️⃣ Wait for panel change intelligently
    const success = await Promise.race([
      // Case A: title text change
      page.waitForFunction(
        (prev) => {
          const el = document.querySelector("h1.DUwDvf");
          return (
            el &&
            el.textContent.trim().length > 0 &&
            el.textContent.trim() !== prev &&
            !document.querySelector(".m6QErb[aria-busy='true']")
          );
        },
        { timeout: 3000 },
        prevName
      ),
      // Case B: frame recreated (panel rebuilt)
      new Promise((resolve) =>
        setTimeout(() => resolve(frameChanged ? true : null), 9000)
      ),
    ]);

    // 7️⃣ Cleanup listener
    page.off("framenavigated", onFrameNav);

    if (!success) {
      console.warn(`⚠️ Panel not refreshed for #${index}`);
      return false;
    }

    // 8️⃣ Small stability wait (panel animations)
    return true;
  } catch (err) {
    console.error(`🚨 Click failed at #${index}:`, (err as Error).message);
    return false;
  }
}
