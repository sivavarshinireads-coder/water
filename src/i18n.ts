import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import mr from './locales/mr/translation.json';
import ta from './locales/ta/translation.json';
import bn from './locales/bn/translation.json';
import te from './locales/te/translation.json';
import gu from './locales/gu/translation.json';
import ml from './locales/ml/translation.json';
import pa from './locales/pa/translation.json';
import kn from './locales/kn/translation.json';
import or from './locales/or/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      ta: { translation: ta },
      bn: { translation: bn },
      te: { translation: te },
      gu: { translation: gu },
      ml: { translation: ml },
      pa: { translation: pa },
      kn: { translation: kn },
      or: { translation: or },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'cookie', 'navigator'], caches: ['localStorage'] },
    // Optional: log missing keys for developers
    saveMissing: true,
    missingKeyHandler: function (lng, ns, key, fallbackValue) {
      console.warn(`Missing translation → language: ${lng}, key: ${key}`);
    },
  });

export default i18n;
