import type { Api } from 'common';
import { useTranslation } from 'react-i18next';

type StopKind = 'stop' | 'station' | 'trainStation';

// Where a vehicle of the given mode is boarded
const getStopKind = (mode: Api.Mode): StopKind => {
    switch (mode) {
        case 'metro':
            return 'station';
        case 'rail':
            return 'trainStation';
        default:
            return 'stop';
    }
};

// Labels of the steps leading to a vehicle, named after where it's boarded
export const useTransitStepLabels = () => {
    const { t } = useTranslation();
    const walkingToLabels: Record<StopKind, string> = {
        stop: t('transitStep.walkingTo.stop'),
        station: t('transitStep.walkingTo.station'),
        trainStation: t('transitStep.walkingTo.trainStation'),
    };
    const waitingAtLabels: Record<StopKind, string> = {
        stop: t('transitStep.waitingAt.stop'),
        station: t('transitStep.waitingAt.station'),
        trainStation: t('transitStep.waitingAt.trainStation'),
    };
    return {
        getWalkingToLabel: (boardingMode: Api.Mode) =>
            walkingToLabels[getStopKind(boardingMode)],
        getWaitingAtLabel: (boardingMode: Api.Mode) =>
            waitingAtLabels[getStopKind(boardingMode)],
    };
};
