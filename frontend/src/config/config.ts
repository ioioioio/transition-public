import { PublicConfig } from 'common';

// Injected by Vite
declare const __CONFIG__: unknown;

export const config = PublicConfig.PublicConfigSchema.pick({
    map: true,
}).parse(__CONFIG__);
