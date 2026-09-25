import { Marker } from '@vis.gl/react-maplibre';
import type { LngLat } from 'maplibre-gl';

type PlaceMarkerProps = {
    label: string;
    position: LngLat;
    onMove: (position: LngLat) => void;
};

const PlaceMarker = ({ label, position, onMove }: PlaceMarkerProps) => {
    return (
        <Marker
            longitude={position.lng}
            latitude={position.lat}
            draggable
            onClick={(event) => event.originalEvent.stopPropagation()}
            onDragEnd={(event) => onMove(event.lngLat)}
        >
            <div className="grid size-7 cursor-grab place-items-center rounded-full border-[1.5px] border-primary bg-background text-xs font-semibold text-foreground shadow-[0_0_16px] shadow-primary/50 active:cursor-grabbing">
                {label}
            </div>
        </Marker>
    );
};

export default PlaceMarker;
