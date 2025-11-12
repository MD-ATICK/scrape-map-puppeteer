import { findPhoneNumbersInText } from "libphonenumber-js";


export function extractPhonesFromJSON(text : string) {

  const results = findPhoneNumbersInText(text);

  const unique = new Set();
  for (const r of results) {
    unique.add(r.number.number); 
  }

  return [...unique];
}
