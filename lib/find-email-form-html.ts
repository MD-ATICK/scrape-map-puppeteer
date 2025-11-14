

export function findEmailFromHtml(html?: string) {

  if (!html) return null;


  const emails = new Set(
    (html.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:[a-z]{2,10})\b/g) || [])
      // remove image or asset file matches
      .filter(
        (email) =>
          !/\.(png|jpg|jpeg|gif|svg|webp|pdf|css|js|woff2?|ttf)$/i.test(
            email
          ) &&
          !/@\d+x/i.test(email) && // remove @2x, @3x, etc.
          !email.includes("sentry.io") && // remove system/telemetry emails
          !email.includes("example.com") && // remove demo emails
          !email.includes("yourcompany.com")
      )
  );

  return [...emails][0];
}