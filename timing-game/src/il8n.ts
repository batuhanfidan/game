import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import tr from "./locals/tr.json";
import en from "./locals/en.json";

const resources = {
  en: {
    translation: en,
  },
  tr: {
    translation: tr,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "tr",
    debug: true,

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
