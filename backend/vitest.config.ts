import { defineConfig } from 'vitest/config';
import { fakeTransitionUrl } from './src/transition/transition.test-utils';

export default defineConfig({
    test: {
        // The generated Transition client needs an address, even when faked
        env: { TRANSITION_URL: fakeTransitionUrl },
        coverage: {
            // Every file, even those no test imports, which would otherwise be
            // missing from the report instead of shown as uncovered
            include: ['src/**/*.ts'],
            exclude: [
                'src/transition/generated/**',
                'src/**/*.test.ts',
                'src/**/*.test-utils.ts',
            ],
        },
    },
});
