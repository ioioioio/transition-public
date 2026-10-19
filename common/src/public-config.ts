import { z } from 'zod';

import * as Utils from './utils';

const MapConfigSchema = z.object({
    defaultCamera: Utils.MapCameraSchema,
    styles: z.object({
        light: z.url(),
        dark: z.url(),
    }),
});

export type MapConfig = z.infer<typeof MapConfigSchema>;

// Routes from the origin to the destination, with the scenario's modes
const StandardRoutingSetupSchema = z.object({
    id: z.string().min(1),
    type: z.literal('standard'),
    scenarioId: z.uuid(),
    modes: z.array(z.string().min(1)).min(1),
});

export type StandardRoutingSetup = z.infer<typeof StandardRoutingSetupSchema>;

const AirportSchema = z.object({
    id: z.string().min(1),
    position: Utils.LngLatSchema,
    securityAndBoardingMinutes: z.number().min(0),
});

// The same in both directions
const FlightSchema = z.object({
    between: z.tuple([z.string().min(1), z.string().min(1)]),
    minutes: z.number().positive(),
});

// Going to and from the airports uses the scenario, the flight uses the
// configured flight times
const PlaneRoutingSetupSchema = z
    .object({
        id: z.string().min(1),
        type: z.literal('plane'),
        scenarioId: z.uuid(),
        modes: z.array(z.string().min(1)).min(1),
        airports: z.array(AirportSchema).min(2),
        flights: z.array(FlightSchema).min(1),
    })
    .refine(
        ({ airports, flights }) =>
            flights.every(({ between }) =>
                between.every((airportId) =>
                    airports.some(({ id }) => id === airportId),
                ),
            ),
        'Flights must be between listed airports',
    );

export type PlaneRoutingSetup = z.infer<typeof PlaneRoutingSetupSchema>;

const RoutingSetupSchema = z.discriminatedUnion('type', [
    StandardRoutingSetupSchema,
    PlaneRoutingSetupSchema,
]);

export type RoutingSetup = z.infer<typeof RoutingSetupSchema>;

// Everything in it must be safe to expose to the browser, even by accident
export const PublicConfigSchema = z.object({
    map: MapConfigSchema,
    routingSetups: z
        .array(RoutingSetupSchema)
        .min(1)
        .refine(
            (routingSetups) =>
                new Set(routingSetups.map(({ id }) => id)).size ===
                routingSetups.length,
            'Routing setup ids must be unique',
        ),
    // Hours of the day the trips can be made at
    tripHours: z.array(z.int().min(0).max(23)).min(1),
    // Passed as is to each of Transition's route requests
    transitionRouting: z.object({
        maxTotalTravelTimeSeconds: z.int().positive(),
    }),
});

export type PublicConfig = z.infer<typeof PublicConfigSchema>;
