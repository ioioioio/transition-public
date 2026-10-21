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

const checkHasUniqueIds = (items: { id: string }[]) =>
    new Set(items.map(({ id }) => id)).size === items.length;

const UnimodalModeSchema = z.enum(['driving', 'walking']);

export type UnimodalMode = z.infer<typeof UnimodalModeSchema>;

const UnimodalRoutingSetupSchema = z.object({
    id: z.string().min(1),
    type: z.literal('unimodal'),
    mode: UnimodalModeSchema,
});

export type UnimodalRoutingSetup = z.infer<typeof UnimodalRoutingSetupSchema>;

const TransitRoutingSetupSchema = z.object({
    id: z.string().min(1),
    type: z.literal('transit'),
    scenarioId: z.uuid(),
});

export type TransitRoutingSetup = z.infer<typeof TransitRoutingSetupSchema>;

const AirportSchema = z.object({
    id: z.string().min(1),
    position: Utils.LngLatSchema,
    securityAndBoardingMinutes: z.number().min(0),
    unboardingAndLuggageMinutes: z.number().min(0),
});

// The same in both directions
const FlightSchema = z.object({
    between: z.tuple([z.string().min(1), z.string().min(1)]),
    minutes: z.number().positive(),
});

const PlaneNetworkSchema = z
    .object({
        id: z.string().min(1),
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

export type PlaneNetwork = z.infer<typeof PlaneNetworkSchema>;

// The plane routing setups stand in for transit with planes, until there's
// GTFS for them. Going to and from the airports is either unimodal or by
// transit, like the routing setups without planes

const PlaneUnimodalRoutingSetupSchema = z.object({
    id: z.string().min(1),
    type: z.literal('plane-unimodal'),
    planeNetworkId: z.string().min(1),
    mode: UnimodalModeSchema,
});

export type PlaneUnimodalRoutingSetup = z.infer<
    typeof PlaneUnimodalRoutingSetupSchema
>;

const PlaneTransitRoutingSetupSchema = z.object({
    id: z.string().min(1),
    type: z.literal('plane-transit'),
    planeNetworkId: z.string().min(1),
    scenarioId: z.uuid(),
});

export type PlaneTransitRoutingSetup = z.infer<
    typeof PlaneTransitRoutingSetupSchema
>;

export type PlaneRoutingSetup =
    PlaneUnimodalRoutingSetup | PlaneTransitRoutingSetup;

const StationSchema = z.object({
    id: z.string().min(1),
    position: Utils.LngLatSchema,
});

const StationNetworkSchema = z.object({
    id: z.string().min(1),
    stations: z.array(StationSchema).min(2),
});

export type StationNetwork = z.infer<typeof StationNetworkSchema>;

// Unimodal to and from the closest stations, and by the scenario's transit
// between them, like being dropped off and picked up by car
const ViaStationsRoutingSetupSchema = z.object({
    id: z.string().min(1),
    type: z.literal('via-stations'),
    scenarioId: z.uuid(),
    requiredModes: z.array(z.string().min(1)).min(1),
    stationNetworkId: z.string().min(1),
    accessEgressMode: UnimodalModeSchema,
});

export type ViaStationsRoutingSetup = z.infer<
    typeof ViaStationsRoutingSetupSchema
>;

const RoutingSetupSchema = z.discriminatedUnion('type', [
    UnimodalRoutingSetupSchema,
    TransitRoutingSetupSchema,
    PlaneUnimodalRoutingSetupSchema,
    PlaneTransitRoutingSetupSchema,
    ViaStationsRoutingSetupSchema,
]);

export type RoutingSetup = z.infer<typeof RoutingSetupSchema>;

// Everything in it must be safe to expose to the browser, even by accident
export const PublicConfigSchema = z.object({
    map: MapConfigSchema,
    routingSetups: z
        .array(RoutingSetupSchema)
        .min(1)
        .refine(checkHasUniqueIds, 'Routing setup ids must be unique'),
    // The airports and flights that plane routing setups can use
    planeNetworks: z
        .array(PlaneNetworkSchema)
        .refine(checkHasUniqueIds, 'Plane network ids must be unique'),
    // The stations that via-stations routing setups can use
    stationNetworks: z
        .array(StationNetworkSchema)
        .refine(checkHasUniqueIds, 'Station network ids must be unique'),
    // Hours of the day the trips can be made at
    tripHours: z.array(z.int().min(0).max(23)).min(1),
    // Passed as is to each of Transition's route requests
    transitionRouting: z.object({
        maxTotalTravelTimeSeconds: z.int().positive(),
    }),
});

export type PublicConfig = z.infer<typeof PublicConfigSchema>;

export const RefinedPublicConfigSchema = PublicConfigSchema.refine(
    ({ routingSetups, planeNetworks }) =>
        routingSetups.every(
            (routingSetup) =>
                !('planeNetworkId' in routingSetup) ||
                planeNetworks.some(
                    ({ id }) => id === routingSetup.planeNetworkId,
                ),
        ),
    'Plane routing setups must use a listed plane network',
).refine(
    ({ routingSetups, stationNetworks }) =>
        routingSetups.every(
            (routingSetup) =>
                routingSetup.type !== 'via-stations' ||
                stationNetworks.some(
                    ({ id }) => id === routingSetup.stationNetworkId,
                ),
        ),
    'Via-stations routing setups must use a listed station network',
);
