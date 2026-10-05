import { z } from 'zod';

// Only the fields we use are declared.
// https://github.com/pelias/documentation/blob/master/autocomplete.md

export const FeatureSchema = z.object({
    geometry: z.object({
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    properties: z.object({
        gid: z.string(),
        label: z.string(),
    }),
});

export type Feature = z.infer<typeof FeatureSchema>;

export const AutocompleteResponseSchema = z.object({
    features: z.array(FeatureSchema),
});
