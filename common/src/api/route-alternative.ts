import { z } from 'zod';

import * as Utils from '../utils';
import { ModeSchema } from './mode';

const WalkingToStopStepSchema = z.object({
    activity: z.literal('walkingToStop'),
    // Of the vehicle boarded at the stop
    boardingMode: ModeSchema,
    geometry: Utils.LineStringSchema,
    durationSeconds: z.number(),
    distanceMeters: z.number(),
});

const WalkingToDestinationStepSchema = z.object({
    activity: z.literal('walkingToDestination'),
    geometry: Utils.LineStringSchema,
    durationSeconds: z.number(),
    distanceMeters: z.number(),
});

const WaitingStepSchema = z.object({
    activity: z.literal('waitingAtStop'),
    // Of the vehicle waited for
    boardingMode: ModeSchema,
    geometry: Utils.PointSchema,
    durationSeconds: z.number(),
});

const BoardingStepSchema = z.object({
    activity: z.literal('boarding'),
    boardingMode: z.literal('plane'),
    geometry: Utils.PointSchema,
    durationSeconds: z.number(),
});

const UnboardingStepSchema = z.object({
    activity: z.literal('unboarding'),
    unboardingMode: z.literal('plane'),
    geometry: Utils.PointSchema,
    durationSeconds: z.number(),
});

const VehicleStepSchema = z.object({
    activity: z.literal('inVehicle'),
    mode: ModeSchema,
    geometry: Utils.LineStringSchema,
    durationSeconds: z.number(),
    distanceMeters: z.number(),
});

// A step of a route, by what's done during it
export const RouteStepSchema = z.discriminatedUnion('activity', [
    WalkingToStopStepSchema,
    WalkingToDestinationStepSchema,
    WaitingStepSchema,
    BoardingStepSchema,
    UnboardingStepSchema,
    VehicleStepSchema,
]);

export type RouteStep = z.infer<typeof RouteStepSchema>;

// A way to make the trip
export const RouteAlternativeSchema = z.object({
    id: z.string(),
    steps: z.array(RouteStepSchema),
});

export type RouteAlternative = z.infer<typeof RouteAlternativeSchema>;
