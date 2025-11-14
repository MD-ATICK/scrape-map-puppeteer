export type ScrapeResultType = {
  scrapeNo: number;
  name: string | null;
  address: string | null;
  phone?: string | null; // phone number
  website: string | null;
  email?: string | null;
  email_status?: string | null;
  status_code?: number | null;
  rating?: string | null;
  reviewsCount?: string | null;
  category?: string | null;

  facebookUrl?: string | null;

  instagramUrl?: string | null;

  linkedinUrl?: string | null;

  tiktokUrl?: string | null;

  lead_scraped_at?: string | null;
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
