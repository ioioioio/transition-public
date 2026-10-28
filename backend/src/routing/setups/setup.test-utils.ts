import type { Api, PublicConfig, Utils } from 'common';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, expect } from 'vitest';
import type {
    TransitionRouteBody,
    TransitionRouteResponse,
} from '../../transition/route';
import { TransitionClient } from '../../transition/transition-client';
import { RouteFetcher } from '../routes/fetch-routes';
import { ScenarioIds } from '../routes/scenario-ids';

const transitionUrl = process.env['TRANSITION_URL'];

export const fakeScenarioName = 'scenario';

type TransitionRouteResult = TransitionRouteResponse['result'];

type UnimodalPath = NonNullable<
    TransitionRouteResult[PublicConfig.UnimodalMode]
>['paths'][number];

type TransitPath = NonNullable<
    TransitionRouteResult['transit']
>['paths'][number];

type TransitStep = TransitPath['steps'][number];

type WalkingStep = Extract<TransitStep, { action: 'walking' }>;

// What boardings and unboardings both say of the line and the stop
type RideAction = Omit<
    Extract<TransitStep, { action: 'boarding' }>,
    'action' | 'departureTime' | 'waitingTime'
>;

// For the fields Transition requires, but the tests don't look at
const dummyNumber = 1;
const dummyText = 'dummy';

// Off the position, like where Transition's paths start and end on the road
// network, or its stops near the origin and destination
const createOffsetPosition = (position: Utils.Position): Utils.Position => {
    return position.map((coordinate) => coordinate + 0.1);
};

const createOffsetUnimodalPath = (
    origin: Utils.Position,
    destination: Utils.Position,
): UnimodalPath => {
    return {
        geometry: {
            type: 'LineString',
            coordinates: [
                createOffsetPosition(origin),
                createOffsetPosition(destination),
            ],
        },
        distanceMeters: dummyNumber,
        travelTimeSeconds: dummyNumber,
    };
};

const createWalkingStep = (): WalkingStep => {
    return {
        action: 'walking',
        type: dummyText,
        travelTime: dummyNumber,
        distance: dummyNumber,
        departureTime: dummyNumber,
        arrivalTime: dummyNumber,
    };
};

const createRideAction = (nodeCoordinates: Utils.Position): RideAction => {
    return {
        agencyAcronym: dummyText,
        agencyName: dummyText,
        agencyUuid: dummyText,
        lineShortname: dummyText,
        lineLongname: dummyText,
        lineUuid: dummyText,
        pathUuid: dummyText,
        modeName: dummyText,
        mode: 'bus', // Required by the via-stations test
        tripUuid: dummyText,
        legSequenceInTrip: dummyNumber,
        stopSequenceInTrip: dummyNumber,
        nodeName: dummyText,
        nodeCode: dummyText,
        nodeUuid: dummyText,
        nodeCoordinates,
    };
};

const createTransitPathWithOffsetStops = (
    origin: Utils.Position,
    destination: Utils.Position,
): TransitPath => {
    return {
        departureTime: dummyNumber,
        arrivalTime: dummyNumber,
        totalTravelTime: dummyNumber,
        totalDistance: dummyNumber,
        totalInVehicleTime: dummyNumber,
        totalInVehicleDistance: dummyNumber,
        totalNonTransitTravelTime: dummyNumber,
        totalNonTransitDistance: dummyNumber,
        numberOfBoardings: dummyNumber,
        numberOfTransfers: dummyNumber,
        transferWalkingTime: dummyNumber,
        transferWalkingDistance: dummyNumber,
        accessTravelTime: dummyNumber,
        accessDistance: dummyNumber,
        egressTravelTime: dummyNumber,
        egressDistance: dummyNumber,
        transferWaitingTime: dummyNumber,
        firstWaitingTime: dummyNumber,
        totalWaitingTime: dummyNumber,
        steps: [
            createWalkingStep(),
            {
                action: 'boarding',
                departureTime: dummyNumber,
                waitingTime: dummyNumber,
                ...createRideAction(createOffsetPosition(origin)),
            },
            {
                action: 'unboarding',
                arrivalTime: dummyNumber,
                inVehicleTime: dummyNumber,
                inVehicleDistance: dummyNumber,
                ...createRideAction(createOffsetPosition(destination)),
            },
            createWalkingStep(),
        ],
    };
};

// Fakes Transition, whose paths and stops don't reach the positions asked
// for, so the tests show the steps get connected despite these gaps
export const setUpFakeTransitionWithGaps = () => {
    const server = setupServer(
        http.post(`${transitionUrl}/token`, () => {
            return HttpResponse.text('token');
        }),
        http.post(`${transitionUrl}/api/v1/route`, async ({ request }) => {
            const body = (await request.json()) as TransitionRouteBody;
            // Never empty: RouteFetcher always asks for one mode
            const [routingMode = ''] = body.routingModes;
            const origin = body.originGeojson.geometry.coordinates;
            const destination = body.destinationGeojson.geometry.coordinates;
            const path =
                routingMode === 'transit'
                    ? createTransitPathWithOffsetStops(origin, destination)
                    : createOffsetUnimodalPath(origin, destination);
            return HttpResponse.json({
                query: body,
                result: { [routingMode]: { paths: [path] } },
            });
        }),
    );

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' });
    });

    afterAll(() => {
        server.close();
    });
};

const scenarios = [
    {
        id: dummyText,
        name: fakeScenarioName,
        services: [],
        only_agencies: [],
        except_agencies: [],
        only_lines: [],
        except_lines: [],
        only_modes: [],
        except_modes: [],
    },
];

export const createRouteFetcherForFakeTransition = async (
    routingSetup: PublicConfig.RoutingSetup,
) => {
    return new RouteFetcher(
        new ScenarioIds([routingSetup], scenarios),
        await TransitionClient.create({
            userName: dummyText,
            password: dummyText,
        }),
        { maxTotalTravelTimeSeconds: dummyNumber },
    );
};

const getPositions = (step: Api.RouteStep): Utils.Position[] => {
    const { geometry } = step;
    return geometry.type === 'Point'
        ? [geometry.coordinates]
        : geometry.coordinates;
};

const getStartPosition = (step: Api.RouteStep) => getPositions(step).at(0);

const getEndPosition = (step: Api.RouteStep) => getPositions(step).at(-1);

// Each step starts where the previous one ends
export const expectStepsToConnect = (
    steps: Api.RouteStep[] | null,
    origin: Utils.LngLat,
    destination: Utils.LngLat,
) => {
    expect(steps).not.toBe(null);
    if (!steps) {
        return;
    }
    const ends = [[origin.lng, origin.lat], ...steps.map(getEndPosition)];
    const starts = [
        ...steps.map(getStartPosition),
        [destination.lng, destination.lat],
    ];
    expect(starts).toEqual(ends);
};
