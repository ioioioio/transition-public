import { defineConfig } from 'orval';

export default defineConfig({
    transition: {
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
            client: 'fetch',
            target: './src/transition/generated',
            schemas: './src/transition/generated/model',
            baseUrl: {
                runtime: 'process.env["TRANSITION_ENDPOINT"]',
            },
        },
    },
});
