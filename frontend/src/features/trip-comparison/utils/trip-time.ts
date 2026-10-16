import type { Api } from 'common';

import { config } from '@/config/config';

const secondsPerHour = 60 * 60;

export const calculateSecondsSinceMidnight = (hours: number) =>
    hours * secondsPerHour;

export const calculateHours = (secondsSinceMidnight: number) =>
    secondsSinceMidnight / secondsPerHour;

export const defaultTripTime: Api.TripTime = {
    type: 'departure',
    secondsSinceMidnight: calculateSecondsSinceMidnight(config.tripHours[0]!),
};
