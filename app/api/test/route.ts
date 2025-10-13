// app/api/scrape/route.ts
import { NextResponse } from "next/server";
// import puppeteer from "puppeteer";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export type ScrapeResult = {
	name: string | null;
	address: string | null;
	phone: string | null;
	website: string | null;
};

export async function GET() {
	const searchQuery = "restaurant";
	const location = "New York";
	const url = `https://www.google.com/maps/search/${encodeURIComponent(
		searchQuery,
	)}+in+${encodeURIComponent(location)}`;

	let browser;
	try {
		// browser = await puppeteer.launch({
		// 	headless: true,
		// 	args: ["--start-maximized", "--no-sandbox"],
		// });

		// @@ For Vercel Deployment with @sparticuz/chromium
		browser = await puppeteer.launch({
			args: chromium.args,
			executablePath: await chromium.executablePath(),
		});
		// @@

		const page = await browser.newPage();
		await page.setViewport({ width: 1900, height: 1200 });
		await page.setUserAgent(
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
		);

		await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
		await wait(3000);

		// LEFT LIST ITEMS (Google Maps Results)
		const itemSelector = "div.Nv2PK"; // Current Google Maps card selector
		await page.waitForSelector(itemSelector, { timeout: 20000 });

		const results: ScrapeResult[] = [];
		let items = await page.$$(itemSelector);

		for (let i = 0; i < 5; i++) {
			try {
				items = await page.$$(itemSelector);
				const item = items[i];
				if (!item) continue;

				await item.evaluate(el => el.scrollIntoView({ block: "center" }));
				await wait(500);
				await item.click();

				// Wait for Detail Panel
				await page
					.waitForSelector("h1.DUwDvf", { timeout: 6000 })
					.catch(() => {});

				const data = await page.evaluate(() => {
					const name = document.querySelector("h1.DUwDvf")?.textContent || null;
					const address =
						document.querySelector("button[data-item-id='address'] div")
							?.textContent || null;
					const phone =
						document.querySelector("button[data-item-id*='phone'] div")
							?.textContent || null;
					const websiteLink = Array.from(document.querySelectorAll("a"))
						.map(a => a.getAttribute("href"))
						.find(
							href =>
								href && href.startsWith("http") && !href.includes("google"),
						);

					return { name, address, phone, website: websiteLink };
				});

				console.log(i + 1, data);
				results.push(data as ScrapeResult);

				await wait(500);
			} catch (err) {
				console.error("Failed at index:", i, err);
			}
		}

		// Close browser
		await browser.close();

		return NextResponse.json({ total: results.length, data: results });
	} catch (error) {
		console.log((error as Error).message);
		if (browser) await browser.close();
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
