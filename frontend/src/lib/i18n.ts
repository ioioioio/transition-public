import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

const resources = {
    'en-CA': {
        translation: en,
    },
    'fr-CA': {
        translation: fr,
    },
};

i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        supportedLngs: ['en-CA', 'fr-CA'],
        fallbackLng: 'en-CA',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
