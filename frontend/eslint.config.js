import js from '@eslint/js';
import pluginRouter from '@tanstack/eslint-plugin-router';
import { defineConfig, globalIgnores } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{js,ts,tsx}'],
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
        plugins: { 'import-x': importX },
        settings: {
            // Reads tsconfig paths so @/ imports count as internal.
            'import-x/resolver-next': [
                createTypeScriptImportResolver({
                    project: new URL('tsconfig.app.json', import.meta.url)
                        .pathname,
                }),
            ],
        },
        rules: {
            'import-x/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                        'object',
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['./*', '../*'],
                            message:
                                'Use an @/ import instead of a relative one.',
                        },
                    ],
                },
            ],
        },
    },
    {
        // shadcn/ui components export their style variants (e.g. buttonVariants) next to the component.
        files: ['src/components/ui/**/*.tsx'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
    {
        files: ['src/app/routes/**/*.tsx'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
    ...pluginRouter.configs['flat/recommended'],
]);
