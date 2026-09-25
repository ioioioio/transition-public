import { defineConfig } from 'orval';

export default defineConfig({
    transitionZod: {
        input: {
            target: 'http://localhost:4321/APIv1/API.yml',
            parserOptions: {
                externalRefs: {
                    allow: ['*'],
                },
            },
        },
        output: {
            mode: 'single',
            client: 'zod',
            target: './src/transition/generated',
            fileExtension: '.zod.ts',
            override: {
                zod: {
                    variant: 'mini',
                    version: 4,
                },
            },
        },
    },
});
