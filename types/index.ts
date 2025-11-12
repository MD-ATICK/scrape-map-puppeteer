export type ScrapeResult = {
  scrapeNo: number;
  name: string | null;
  address: string | null;
  phone?: string | null; // phone number
  website: string | null;
  email?: string | null;
  rating?: string | null;
  reviewsCount?: string | null;
  category?: string | null;
  
  facebookUrl?: string | null;

  instagramUrl?: string | null;

  linkedinUrl?: string | null;
  
  tiktokUrl?: string | null;

};
