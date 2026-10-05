import { defineConfig } from 'i18next-cli';

export default defineConfig({
    locales: ['en-CA', 'fr-CA'],
    extract: {
        input: ['src/**/*.{ts,tsx}'],
        output: 'src/locales/{{language}}.json',
        indentation: 4,
    },
});
