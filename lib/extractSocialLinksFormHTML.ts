import { SocialLinks } from "@/types";

 export function extractSocialLinksFromHTML(hrefs: string[]): SocialLinks {
  const socials: SocialLinks = {
    facebook: null,
    instagram: null,
    twitter: null,
    x: null,
    linkedin: null,
    tiktok: null,
  };

  for (const href of hrefs) {
    if (!href) continue;
    const h = href.toLowerCase();

    if (
      !socials.facebook &&
      (h.includes("facebook.com/") || h.includes("fb.me/"))
    ) {
      socials.facebook = href;
    }
    if (!socials.instagram && h.includes("instagram.com/")) {
      socials.instagram = href;
    }
    // Twitter/X: account can be on twitter.com or x.com
    if (
      !socials.twitter &&
      (h.includes("twitter.com/") || h.includes("x.com/"))
    ) {
      socials.twitter = href;
    }
    // optionally populate x separately if needed
    if (!socials.x && h.includes("x.com/")) {
      socials.x = href;
    }
    if (!socials.linkedin && h.includes("linkedin.com/")) {
      socials.linkedin = href;
    }
    if (!socials.tiktok && h.includes("tiktok.com/")) {
      socials.tiktok = href;
    }

    // stop early if everything found
    if (
      socials.facebook &&
      socials.instagram &&
      (socials.twitter || socials.x) &&
      socials.linkedin &&
      socials.tiktok
    ) {
      break;
    }
  }

  // Normalize to null for empty strings
  for (const k of Object.keys(socials) as (keyof SocialLinks)[]) {
    if (!socials[k]) socials[k] = null;
  }

  return socials;
}
