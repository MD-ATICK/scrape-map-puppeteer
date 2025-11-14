import { clsx, type ClassValue } from "clsx"
import { differenceInHours, format, formatDistanceToNow } from "date-fns";
import { Page } from "puppeteer-core";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getFreshItem(page: Page, index: number) {
  const items = await page.$$("div.Nv2PK");
  return items[index] || null;
}

export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
export const GOOGLE_MAP_BASE_URL = "https://www.google.com/maps/search";
 
export const executablePath = "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

// IF DEPLOYED
// browser = await puppeteerCore.launch({
// 	executablePath: await chromium.executablePath(path),
// 	args: chromium.args,
// 	headless: true,
// });
// JUST COPY PASTE TOP SECTION

export function formatSmartDate(dateString: string | number | Date) {
  const date = new Date(dateString);

  const hours = differenceInHours(Date.now(), date);

  // Less than 24 hours → use "x hours ago"
  if (hours < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  // More than 1 day → show real date
  return format(date, "MMM dd, yyyy"); // example: "Nov 14, 2025"
}