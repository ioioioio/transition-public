import type { Api } from 'common';

import { config } from '@/config/config';

export const defaultTripTime: Api.TripTime = {
    type: 'departure',
    hour: config.tripHours[0]!,
};
