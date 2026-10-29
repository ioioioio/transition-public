import type { Api } from 'common';

import { config } from '@/config/config';

const defaultHour = config.tripHours.at(0);
if (defaultHour === undefined) {
    throw new Error('The config must have at least one trip hour');
}

export const defaultTripTime: Api.TripTime = {
    type: 'departure',
    hour: defaultHour,
};
