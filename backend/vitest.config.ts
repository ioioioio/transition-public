import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            // Including the files no test loads, which are the least covered
            include: ['src/**/*.ts'],
            exclude: ['src/transition/generated/**', 'src/**/*.test.ts'],
        },
    },
});
