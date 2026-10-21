import { existsSync, readFileSync } from 'node:fs';
import { PublicConfig } from 'common';

const configFileName = 'config.public.json';

const configPath = `../${configFileName}`;

const readConfig = (): unknown => {
    if (!existsSync(configPath)) {
        throw new Error(
            `Missing ${configFileName} at the root: copy and edit config.public.json.example to start`,
        );
    }
    return JSON.parse(readFileSync(configPath, 'utf8'));
};

export const config =
    PublicConfig.RefinedPublicConfigSchema.parse(readConfig());
