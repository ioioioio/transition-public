import { PublicConfig } from 'common';

// Injected by Vite
declare const __CONFIG__: unknown;

// .pick() cannot be used on object schemas containing refinements (zod 4.6.5)
// Hence RefinedPublicConfigSchema cannot be used here.
export const config = PublicConfig.PublicConfigSchema.pick({
    map: true,
    routingSetups: true,
    tripHours: true,
}).parse(__CONFIG__);
