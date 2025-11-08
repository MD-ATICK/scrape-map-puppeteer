export type ScrapeResult = {
  scrapeNo: number;
  name: string | null;
  address: string | null;
  phone?: string | null; // phone number
  website: string | null;
  email?: string | null;
  socials?: SocialLinks | null;
  rating?: string | null;
  reviewsCount?: string | null;
  category?: string | null;
};

export type SocialLinks = {
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null; // twitter or x
  x?: string | null; // optional separate field if you want
  linkedin?: string | null;
  tiktok?: string | null;
};
