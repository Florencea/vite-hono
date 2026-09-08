import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { config } from "./i18n.shared";

void i18n.use(LanguageDetector).use(initReactI18next).init(config);

declare module "i18next" {
  interface CustomTypeOptions {
    resources: (typeof config.resources)["en-US"];
  }
}

export default i18n;
