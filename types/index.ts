export enum EmailStatus {
  Deliverable = "Deliverable",
  Undeliverable = "Undeliverable",
  Disposable = "Disposable",
  Invalid = "Invalid",
  Blocked = "Blocked",
  Missing = "Missing Email",
}

export type ScrapeResultType = {
  scrapeNo: number;
  name: string;
  address: string;
  phone: string; // phone number
  website: string;
  email: string;
  email_status: EmailStatus;
  rating: string;
  reviewsCount: string;
  category: string;

  facebookUrl: string;

  instagramUrl: string;

  linkedinUrl: string;

  tiktokUrl: string;

  lead_scraped_at: string;
};

export type FetchingDataType = {
  id: string;
  category: string;
  location: string;
  startedAt: number;
  maxScrape: string;
  consumedTime: number;
  status: string;
  scrapedDataCount? : number
};
