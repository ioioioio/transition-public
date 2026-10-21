import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import * as YAML from 'yaml';

const envDir = '..';

const configFileName = 'config.public.yaml';

const configPath = fileURLToPath(
    new URL(`../${configFileName}`, import.meta.url),
);

const readConfig = (): Record<string, unknown> => {
    if (!existsSync(configPath)) {
        throw new Error(
            `Missing ${configFileName} at the root: copy and edit config.public.example.yaml to start`,
        );
    }
    return YAML.parse(readFileSync(configPath, 'utf8'));
};

// Only what the browser uses, so that the rest never reaches the bundle. It
// makes the bundle lighter and avoids exposing unneeded information: even if
// none of it is secret, we'd rather not expose the stations' exact coordinates.
const readBrowserConfig = () => {
    const { map, routingSetups, tripHours } = readConfig();
    return { map, routingSetups, tripHours };
};

const restartOnConfigChange = (): Plugin => ({
    name: 'restart-on-config-change',
    configureServer(server) {
        server.watcher.add(configPath);
        server.watcher.on('change', (file) => {
            if (file === configPath) {
                void server.restart();
            }
        });
    },
});

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
            restartOnConfigChange(),
        ],
        resolve: {
            alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
        },
        envDir,
        define: { __CONFIG__: readBrowserConfig() },
        server: {
            proxy: { '/api': `http://localhost:${BACKEND_PORT}` },
        },
    };
});
