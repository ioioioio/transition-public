import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCA from '@/locales/en-CA.json';
import frCA from '@/locales/fr-CA.json';

const resources = {
    'en-CA': {
        translation: enCA,
    },
    'fr-CA': {
        translation: frCA,
    },
};

declare module 'i18next' {
    interface CustomTypeOptions {
        resources: (typeof resources)['en-CA'];
    }
}

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
