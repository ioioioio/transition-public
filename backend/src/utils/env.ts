export const getEnv = (key: string, defaultValue?: string): string => {
    const value = process.env[key] ?? defaultValue;
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

// A comma-separated list, e.g. "driving,walking"
export const getListEnv = (key: string): string[] => {
    const values = getEnv(key)
        .split(',')
        .map((value) => value.trim());
    if (values.includes('')) {
        throw new Error(`Invalid list environment variable: ${key}`);
    }
    return values;
};
