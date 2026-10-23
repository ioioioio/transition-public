import type { Api, PublicConfig, Utils } from 'common';
import { config } from '../../config';
import {
    postTransitionRoute,
    type TransitionRouteBody,
    type TransitionRouteResponse,
} from '../../transition/route';
import { createPointFeature } from '../../utils/geo';
import { getScenarioId } from './scenario-ids';
import {
    createTransitRouteSteps,
    createUnimodalRouteSteps,
} from './route-steps';

export type OdTrip = {
    origin: Utils.LngLat;
    destination: Utils.LngLat;
    time: { type: Api.TripTimeType; secondsSinceMidnight: number };
};

const createTransitionTime = ({
    type,
    secondsSinceMidnight,
}: OdTrip['time']) => {
    // Times computed from Transition's travel times have decimals, but it
    // only accepts whole seconds in requests
    const wholeSeconds = Math.round(secondsSinceMidnight);
    return type === 'departure'
        ? { departureTimeSecondsSinceMidnight: wholeSeconds }
        : { arrivalTimeSecondsSinceMidnight: wholeSeconds };
};

const createTransitTransitionRouteBody = (
    { origin, destination, time }: OdTrip,
    scenarioId: string,
): TransitionRouteBody => ({
    scenarioId,
    ...createTransitionTime(time),
    routingModes: ['transit'],
    originGeojson: createPointFeature(origin),
    destinationGeojson: createPointFeature(destination),
    maxTotalTravelTimeSeconds:
        config.public.transitionRouting.maxTotalTravelTimeSeconds,
});

const fetchTransitRoute = (
    odTrip: OdTrip,
    scenarioName: string,
): Promise<TransitionRouteResponse> => {
    return postTransitionRoute(
        createTransitTransitionRouteBody(odTrip, getScenarioId(scenarioName)),
    );
};

const fetchUnimodalRoute = (
    { origin, destination }: Pick<OdTrip, 'origin' | 'destination'>,
    mode: PublicConfig.UnimodalMode,
): Promise<TransitionRouteResponse> => {
    return postTransitionRoute({
        routingModes: [mode],
        originGeojson: createPointFeature(origin),
        destinationGeojson: createPointFeature(destination),
    });
};

type TransitPath = NonNullable<
    TransitionRouteResponse['result']['transit']
>['paths'][number];

const checkUsesRequiredModes = (path: TransitPath, requiredModes: string[]) => {
    const usedModes = new Set(
        path.steps.flatMap((step) =>
            step.action === 'boarding' ? [step.mode] : [],
        ),
    );
    return requiredModes.every((mode) => usedModes.has(mode));
};

// Null when there's no route, or when it doesn't use all the required modes
export const fetchTransitRouteSteps = async (
    odTrip: OdTrip,
    scenarioName: string,
    requiredModes: string[] = [],
): Promise<Api.RouteStep[] | null> => {
    const transitionRoute = await fetchTransitRoute(odTrip, scenarioName);
    const path = transitionRoute.result.transit?.paths.at(0);
    if (path && !checkUsesRequiredModes(path, requiredModes)) {
        return null;
    }
    return createTransitRouteSteps(transitionRoute);
};

// Null when there's no route
export const fetchUnimodalRouteSteps = async (
    odTrip: Pick<OdTrip, 'origin' | 'destination'>,
    mode: PublicConfig.UnimodalMode,
): Promise<Api.RouteStep[] | null> => {
    const transitionRoute = await fetchUnimodalRoute(odTrip, mode);
    return createUnimodalRouteSteps(transitionRoute, mode);
};
