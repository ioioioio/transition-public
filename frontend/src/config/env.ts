export const getEnv = (key: string, defaultValue?: string): string => {
    const value = import.meta.env[key] ?? defaultValue;
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

const getNumberEnv = (key: string): number => {
    const value = getEnv(key);
    const number = Number(value);
    if (!Number.isFinite(number)) {
        throw new Error(`Invalid numeric environment variable: ${key}`);
    }
    return number;
};

export const mapInitialView = {
    lng: getNumberEnv('VITE_MAP_INITIAL_LONGITUDE'),
    lat: getNumberEnv('VITE_MAP_INITIAL_LATITUDE'),
    zoom: getNumberEnv('VITE_MAP_INITIAL_ZOOM'),
};
export const mapStyleLight = getEnv('VITE_MAP_STYLE_LIGHT');
export const mapStyleDark = getEnv('VITE_MAP_STYLE_DARK');
