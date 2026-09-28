import { defineConfig, defineTransformer } from 'orval';

type RouteResponseSpec = {
    content?: {
        'application/json'?: {
            schema?: {
                properties?: { result?: { properties?: Record<string, unknown>; additionalProperties?: unknown } };
            };
        };
    };
};

// Orval's zod client ignores `additionalProperties` when an object also has `properties` (a bug).
// The route result lists `transit`, and the other modes as additional properties, so Orval ignores them.
// This fix lists those modes explicitly in the spec, so Orval generates them.
const fixRouteResult = defineTransformer((spec) => {
    // Selection of modes. May need to be extended depending on the needs.
    const unimodalRoutingModes = ['walking', 'cycling', 'driving', 'bus_suburb', 'bus_urban'];

    const response = spec.paths?.['/api/v1/route']?.post?.responses?.['200'] as RouteResponseSpec | undefined;
    const result = response?.content?.['application/json']?.schema?.properties?.result;
    if (!result?.properties || typeof result.additionalProperties !== 'object') {
        throw new Error('fixRouteResult: the route result changed in the spec.');
    }
    for (const mode of unimodalRoutingModes) {
        result.properties[mode] = result.additionalProperties;
    }
    return spec;
});

export default defineConfig({
    transitionZod: {
        input: {
            target: 'http://localhost:4321/APIv1/API.yml',
            parserOptions: {
                externalRefs: {
                    allow: ['*'],
                },
            },
            override: {
                transformer: fixRouteResult,
            },
        },
        output: {
            mode: 'single',
            client: 'zod',
            target: './src/transition/generated',
            fileExtension: '.zod.ts',
            override: {
                zod: {
                    variant: 'mini',
                    version: 4,
                },
            },
        },
    },
});
