// Stacking order of the markers drawn over the map, from back to front
export const markerLayers = {
    // Below every label, so a leader never crosses over one
    leader: 0,
    label: 1,
    place: 2,
} as const;
