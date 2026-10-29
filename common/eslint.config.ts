import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js },
        extends: [
            'js/recommended',
            tseslint.configs.strict,
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.stylisticTypeChecked,
        ],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: new URL('.', import.meta.url).pathname,
            },
        },
    },
    {
        files: ['**/*.md'],
        plugins: { markdown },
        language: 'markdown/commonmark',
        extends: ['markdown/recommended'],
    },
]);
