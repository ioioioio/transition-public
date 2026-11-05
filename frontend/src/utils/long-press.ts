const longPressMilliseconds = 250;

export const isLongPress = (pressStartedAt: number) =>
    Date.now() - pressStartedAt >= longPressMilliseconds;
