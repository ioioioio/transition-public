import { useMediaQuery } from '@/hooks/use-media-query';

/** Whether the screen is narrower than Tailwind's `md` breakpoint. */
export const useIsPhone = () => {
    const breakpoint = getComputedStyle(document.documentElement)
        .getPropertyValue('--breakpoint-md')
        .trim();
    if (!breakpoint) {
        throw new Error('--breakpoint-md is missing from the root styles');
    }
    return useMediaQuery(`(width < ${breakpoint})`);
};
