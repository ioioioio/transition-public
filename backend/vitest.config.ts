import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // The generated Transition client needs an address, even when faked
        env: { TRANSITION_ENDPOINT: 'http://transition.test' },
        coverage: {
            // Every file, even those no test imports, which would otherwise be
            // missing from the report instead of shown as uncovered
            include: ['src/**/*.ts'],
            exclude: ['src/transition/generated/**', 'src/**/*.test.ts'],
        },
    },
});
