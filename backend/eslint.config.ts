import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import markdown from '@eslint/markdown';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['coverage', 'dist', 'src/transition/generated']),
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js },
        extends: [
            'js/recommended',
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
        ],
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: new URL('.', import.meta.url).pathname,
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                {
                    allowAny: false,
                    allowBoolean: false,
                    allowNever: false,
                    allowNullish: false,
                    allowNumber: true,
                    allowRegExp: false,
                },
            ],
        },
    },
    {
        files: ['**/*.md'],
        plugins: { markdown },
        language: 'markdown/commonmark',
        extends: ['markdown/recommended'],
    },
]);
