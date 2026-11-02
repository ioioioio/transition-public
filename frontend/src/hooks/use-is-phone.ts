import { useMediaQuery } from '@/hooks/use-media-query';

/**
 * Whether the screen is narrower than Tailwind's `md` breakpoint, where the side panel is above the
 * map rather than beside it. Subscribes to changes.
 */
export const useIsPhone = () => !useMediaQuery('(min-width: 48rem)');
