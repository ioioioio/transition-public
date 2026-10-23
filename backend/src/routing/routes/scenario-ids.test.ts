import type { PublicConfig } from 'common';
import { expect, it } from 'vitest';
import type { TransitionScenario } from '../../transition/scenarios';
import { ScenarioIds } from './scenario-ids';

const createScenario = (id: string, name: string) => {
    return { id, name } as TransitionScenario;
};

const routingSetups: PublicConfig.RoutingSetup[] = [
    { id: 'transit', type: 'transit', scenarioName: 'reference' },
];

it("finds the id of a routing setup's scenario", () => {
    const scenarioIds = new ScenarioIds(routingSetups, [
        createScenario('id-1', 'reference'),
        createScenario('id-2', 'other'),
    ]);
    expect(scenarioIds.get('reference')).toBe('id-1');
});

it("throws when no scenario has a routing setup's scenario name", () => {
    expect(
        () => new ScenarioIds(routingSetups, [createScenario('id-2', 'other')]),
    ).toThrow('No Transition scenario is named "reference"');
});

it("throws when several scenarios have a routing setup's scenario name", () => {
    expect(
        () =>
            new ScenarioIds(routingSetups, [
                createScenario('id-1', 'reference'),
                createScenario('id-3', 'reference'),
            ]),
    ).toThrow('Several Transition scenarios are named "reference"');
});

it('accepts several scenarios sharing a name no routing setup uses', () => {
    const scenarioIds = new ScenarioIds(routingSetups, [
        createScenario('id-1', 'reference'),
        createScenario('id-2', 'other'),
        createScenario('id-3', 'other'),
    ]);
    expect(scenarioIds.get('reference')).toBe('id-1');
});

it('ignores the routing setups without a scenario', () => {
    const unimodalSetups: PublicConfig.RoutingSetup[] = [
        { id: 'driving', type: 'unimodal', mode: 'driving' },
    ];
    expect(() => new ScenarioIds(unimodalSetups, [])).not.toThrow();
});

it('throws when asked for a scenario no routing setup uses', () => {
    const scenarioIds = new ScenarioIds(routingSetups, [
        createScenario('id-1', 'reference'),
    ]);
    expect(() => scenarioIds.get('other')).toThrow('Unknown scenario: other');
});
