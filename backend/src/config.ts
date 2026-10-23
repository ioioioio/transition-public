import { existsSync, readFileSync } from 'node:fs';
import { PublicConfig } from 'common';
import * as YAML from 'yaml';

const publicConfigFileName = 'config.public.yaml';

const publicConfigPath = `../${publicConfigFileName}`;

const readPublicConfig = (): unknown => {
    if (!existsSync(publicConfigPath)) {
        throw new Error(
            `Missing ${publicConfigFileName} at the root: copy and edit config.public.example.yaml to start`,
        );
    }
    return YAML.parse(readFileSync(publicConfigPath, 'utf8'));
};

export const config = {
    public: PublicConfig.RefinedPublicConfigSchema.parse(readPublicConfig()),
};
