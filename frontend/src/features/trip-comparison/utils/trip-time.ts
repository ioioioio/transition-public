import type { Api } from 'common';

import { tripHours } from '@/config/env';

const secondsPerHour = 60 * 60;

export const calculateSecondsSinceMidnight = (hours: number) =>
    hours * secondsPerHour;

export const calculateHours = (secondsSinceMidnight: number) =>
    secondsSinceMidnight / secondsPerHour;

export const defaultTripTime: Api.TripTime = {
    type: 'departure',
    secondsSinceMidnight: calculateSecondsSinceMidnight(tripHours[0]!),
};
