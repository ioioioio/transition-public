import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const envDir = '..';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const { BACKEND_PORT } = loadEnv(mode, envDir, '');

    return {
        plugins: [
            react(),
            babel({ presets: [reactCompilerPreset()] }),
            tailwindcss(),
        ],
        envDir,
        server: {
            proxy: { '/api': `http://localhost:${BACKEND_PORT}` },
        },
    };
});
