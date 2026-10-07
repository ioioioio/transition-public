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

// A comma-separated list of hours of the day, e.g. "8,12,16"
const getHourListEnv = (key: string): number[] => {
    const hours = getEnv(key)
        .split(',')
        .map((value) => (value.trim() === '' ? NaN : Number(value)));
    if (
        !hours.every(
            (hour) => Number.isInteger(hour) && hour >= 0 && hour <= 23,
        )
    ) {
        throw new Error(`Invalid hour list environment variable: ${key}`);
    }
    return hours;
};

export const mapDefaultView = {
    lng: getNumberEnv('VITE_MAP_DEFAULT_LONGITUDE'),
    lat: getNumberEnv('VITE_MAP_DEFAULT_LATITUDE'),
    zoom: getNumberEnv('VITE_MAP_DEFAULT_ZOOM'),
};
export const mapStyleLight = getEnv('VITE_MAP_STYLE_LIGHT');
export const mapStyleDark = getEnv('VITE_MAP_STYLE_DARK');
export const tripHours = getHourListEnv('VITE_TRIP_HOURS');
