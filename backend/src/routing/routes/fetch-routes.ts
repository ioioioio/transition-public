import type { Api, PublicConfig, Utils } from 'common';
import { config } from '../../config';
import type {
    TransitionRouteBody,
    TransitionRouteResponse,
} from '../../transition/route';
import type { TransitionClient } from '../../transition/transition-client';
import { createPointFeature } from '../../utils/geo';
import type { ScenarioIds } from './scenario-ids';
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

export class RouteFetcher {
    constructor(
        private readonly scenarioIds: ScenarioIds,
        private readonly transition: TransitionClient,
    ) {}

    // Null when there's no route, or when it doesn't use all the required
    // modes
    async fetchTransitRouteSteps(
        odTrip: OdTrip,
        scenarioName: string,
        requiredModes: string[] = [],
    ): Promise<Api.RouteStep[] | null> {
        const transitionRoute = await this.fetchTransitRoute(
            odTrip,
            scenarioName,
        );
        const path = transitionRoute.result.transit?.paths.at(0);
        if (path && !checkUsesRequiredModes(path, requiredModes)) {
            return null;
        }
        return createTransitRouteSteps(transitionRoute);
    }

    // Null when there's no route
    async fetchUnimodalRouteSteps(
        odTrip: Pick<OdTrip, 'origin' | 'destination'>,
        mode: PublicConfig.UnimodalMode,
    ): Promise<Api.RouteStep[] | null> {
        const transitionRoute = await this.fetchUnimodalRoute(odTrip, mode);
        return createUnimodalRouteSteps(transitionRoute, mode);
    }

    private fetchTransitRoute(
        odTrip: OdTrip,
        scenarioName: string,
    ): Promise<TransitionRouteResponse> {
        return this.transition.postRoute(
            createTransitTransitionRouteBody(
                odTrip,
                this.scenarioIds.get(scenarioName),
            ),
        );
    }

    private fetchUnimodalRoute(
        odTrip: Pick<OdTrip, 'origin' | 'destination'>,
        mode: PublicConfig.UnimodalMode,
    ): Promise<TransitionRouteResponse> {
        return this.transition.postRoute({
            routingModes: [mode],
            originGeojson: createPointFeature(odTrip.origin),
            destinationGeojson: createPointFeature(odTrip.destination),
        });
    }
}
