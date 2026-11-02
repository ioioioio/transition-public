// When a label opens or closes its details. Starts fast and settles gently,
// like Material's standard easing.
export const resizeTransition = {
    duration: 0.25,
    ease: [0.2, 0, 0, 1],
} as const;
