export const getEnv = (key: string, defaultValue?: string): string => {
    const value = import.meta.env[key] ?? defaultValue;
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
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

export const tripHours = getHourListEnv('VITE_TRIP_HOURS');
