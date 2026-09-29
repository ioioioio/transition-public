import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import pluginRouter from '@tanstack/eslint-plugin-router'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                tsconfigRootDir: new URL('.', import.meta.url).pathname,
            },
        },
    },
    {
        // shadcn/ui components export their style variants (e.g. buttonVariants) next to the component.
        files: ['src/components/ui/**/*.tsx'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
    ...pluginRouter.configs['flat/recommended'],
]);
