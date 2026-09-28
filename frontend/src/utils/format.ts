/** Formats a duration in hours and minutes, like `1 h et 5 min` in `fr-CA`. */
export const formatDuration = (seconds: number, locale: string) => {
    const minutes = Math.max(1, Math.round(seconds / 60));
    return new Intl.DurationFormat(locale, { style: 'short' }).format({
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60,
    });
};

/** Formats a distance in kilometers, like `4,7 km` in `fr-CA`. */
export const formatDistance = (meters: number, locale: string) => {
    const kilometers = new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: 'kilometer',
        maximumFractionDigits: 1,
    });
    return kilometers.format(meters / 1000);
};
