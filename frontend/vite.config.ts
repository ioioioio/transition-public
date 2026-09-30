import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { fileURLToPath } from 'node:url';

const envDir = '..';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const { BACKEND_PORT } = loadEnv(mode, envDir, '');

    return {
        plugins: [
            // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
            tanstackRouter({
                target: 'react',
                // from doc: https://tanstack.com/router/latest/docs/api/file-based-routing#autocodesplitting
                // 'The next major release of TanStack Router (i.e. v2), will have this value defaulted to true.'
                autoCodeSplitting: true,
                routesDirectory: './src/app/routes',
                generatedRouteTree: './src/app/routeTree.gen.ts',
            }),
            react(),
            babel({ presets: [reactCompilerPreset()] }),
            tailwindcss(),
        ],
        resolve: {
            alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
        },
        envDir,
        server: {
            proxy: { '/api': `http://localhost:${BACKEND_PORT}` },
        },
    };
});
