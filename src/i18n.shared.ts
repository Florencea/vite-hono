import enUS from "./locales/en-US";
import zhTW from "./locales/zh-TW";

const resources = {
  "en-US": enUS,
  "zh-TW": zhTW,
} as const;

export const config = {
  resources,
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
  showSupportNotice: false,
};
