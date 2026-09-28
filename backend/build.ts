import { build } from 'esbuild';
import packageJson from './package.json' with { type: 'json' };

await build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node24',
    outfile: 'dist/index.js',
    external: Object.keys(packageJson.dependencies).filter(
        (name) => name !== 'common',
    ),
});
