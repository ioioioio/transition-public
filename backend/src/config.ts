import { existsSync, readFileSync } from 'node:fs';
import { PublicConfig } from 'common';
import * as YAML from 'yaml';

const configFileName = 'config.public.yaml';

const configPath = `../${configFileName}`;

const readConfig = (): unknown => {
    if (!existsSync(configPath)) {
        throw new Error(
            `Missing ${configFileName} at the root: copy and edit config.public.example.yaml to start`,
        );
    }
    return YAML.parse(readFileSync(configPath, 'utf8'));
};

export const config =
    PublicConfig.RefinedPublicConfigSchema.parse(readConfig());
