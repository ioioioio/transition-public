import { config } from '../../config';
import {
    fetchTransitionScenarios,
    type TransitionScenario,
} from '../../transition/scenarios';

const configScenarioNames = new Set(
    config.public.routingSetups.flatMap((routingSetup) =>
        'scenarioName' in routingSetup ? [routingSetup.scenarioName] : [],
    ),
);

const findScenarioId = (scenarios: TransitionScenario[], name: string) => {
    const namedScenarios = scenarios.filter(
        (scenario) => scenario.name === name,
    );
    if (namedScenarios.length > 1) {
        throw new Error(`Several Transition scenarios are named "${name}"`);
    }
    const [scenario] = namedScenarios;
    if (!scenario) {
        const names = scenarios
            .map((scenario) => `"${scenario.name}"`)
            .join(', ');
        throw new Error(
            `No Transition scenario is named "${name}", only ${names}`,
        );
    }
    return scenario.id;
};

const createScenarioIds = async () => {
    const scenarios = await fetchTransitionScenarios();
    return new Map(
        [...configScenarioNames].map((name) => [
            name,
            findScenarioId(scenarios, name),
        ]),
    );
};

// Found at startup, so that a wrong name in the config stops the backend
const scenarioIds = await createScenarioIds();

export const getScenarioId = (scenarioName: string) => {
    const scenarioId = scenarioIds.get(scenarioName);
    if (scenarioId === undefined) {
        throw new Error(`Unknown scenario: ${scenarioName}`);
    }
    return scenarioId;
};
