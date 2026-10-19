export const calculateTotalDurationSeconds = (
    items: { durationSeconds: number }[],
) => items.reduce((total, { durationSeconds }) => total + durationSeconds, 0);
