import type { PublicConfig } from 'common';
import type { TransitionScenario } from '../../transition/scenarios';

const findScenarioId = (scenarios: TransitionScenario[], name: string) => {
    const namedScenarios = scenarios.filter(
        (scenario) => scenario.name === name,
    );
    if (namedScenarios.length > 1) {
        throw new Error(`Several Transition scenarios are named "${name}"`);
    }
    const [scenario] = namedScenarios;
    if (!scenario) {
        throw new Error(`No Transition scenario is named "${name}"`);
    }
    return scenario.id;
};

export class ScenarioIds {
    private readonly idsByName: Map<string, string>;

    // Throws when a routing setup's scenario is missing or ambiguous in
    // Transition
    constructor(
        routingSetups: PublicConfig.RoutingSetup[],
        scenarios: TransitionScenario[],
    ) {
        const names = new Set(
            routingSetups.flatMap((routingSetup) =>
                'scenarioName' in routingSetup
                    ? [routingSetup.scenarioName]
                    : [],
            ),
        );
        this.idsByName = new Map(
            [...names].map((name) => [name, findScenarioId(scenarios, name)]),
        );
    }

    get(scenarioName: string): string {
        const scenarioId = this.idsByName.get(scenarioName);
        if (scenarioId === undefined) {
            throw new Error(`Unknown scenario: ${scenarioName}`);
        }
        return scenarioId;
    }
}
