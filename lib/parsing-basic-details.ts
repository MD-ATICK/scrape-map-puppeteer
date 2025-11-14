import { ScrapeResultType } from './../types/index';



    // eslint-disable-next-line
export function parsingBasicDetails(raw: any, count: number): ScrapeResultType {
  const info = raw?.[6] ?? [];
  const addressArray = info?.[2];
  const ratingBlock = info?.[4];
  const websiteBlock = info?.[7];
  const name =
    typeof info?.[12] === "string"
      ? info[12]
      : typeof info?.[11] === "string"
      ? info[11]
      : null;
  const address = Array.isArray(addressArray)
    ? addressArray.filter(Boolean).join(", ")
    : null;
  const website =
    Array.isArray(websiteBlock) && typeof websiteBlock[0] === "string"
      ? websiteBlock[0]
      : null;
  const rating =
    Array.isArray(ratingBlock) && typeof ratingBlock[7] === "number"
      ? ratingBlock[7].toString()
      : null;
  const reviewsCount =
    Array.isArray(ratingBlock) && typeof ratingBlock[8] === "number"
      ? ratingBlock[8].toString()
      : null;

  return {
    scrapeNo: count,
    name,
    address,
    website,
    rating,
    reviewsCount,
  };
}