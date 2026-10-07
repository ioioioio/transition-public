import type { Api } from 'common';

const secondsPerHour = 60 * 60;

export const calculateSecondsSinceMidnight = (hours: number) =>
    hours * secondsPerHour;

export const calculateHours = (secondsSinceMidnight: number) =>
    secondsSinceMidnight / secondsPerHour;

export const tripHours = [8, 12, 16];

export const defaultTripTime: Api.TripTime = {
    type: 'departure',
    secondsSinceMidnight: calculateSecondsSinceMidnight(tripHours[0]!),
};
