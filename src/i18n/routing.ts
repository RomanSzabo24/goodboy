import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sk", "en"],
  defaultLocale: "sk",
  // Always default to Slovak regardless of the browser's Accept-Language —
  // the target audience is Slovak/Czech visitors; language only changes via
  // the in-app switcher (which persists the choice in a cookie).
  localeDetection: false,
});
