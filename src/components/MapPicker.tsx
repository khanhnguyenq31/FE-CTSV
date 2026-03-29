import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix Leaflet's default marker icon issue with Vite/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
    latitude?: number;
    longitude?: number;
    radius?: number;
    onChange: (lat: number, lng: number) => void;
}

const MapEvents = ({ onChange }: { onChange: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Search field using leaflet-geosearch
const SearchField = ({ onChange }: { onChange: (lat: number, lng: number) => void }) => {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const searchControl = new (GeoSearchControl as any)({
            provider: provider,
            style: 'bar',
            showMarker: false,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: false,
            searchLabel: 'Nhập địa chỉ, tên đường (vd: Phố đi bộ)',
        });

        map.addControl(searchControl);

        const handleLocation = (e: any) => {
            if (e.location && e.location.y !== undefined && e.location.x !== undefined) {
                onChange(e.location.y, e.location.x);
            }
        };

        map.on('geosearch/showlocation', handleLocation);

        return () => {
            map.removeControl(searchControl);
            map.off('geosearch/showlocation', handleLocation);
        };
    }, [map, onChange]);

    return null;
};

const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
};

// Force map to recalculate its size after a short delay (fixes gray area in Modals)
const MapInvalidator = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 400); // 400ms is enough for most modal fade-in animations to finish
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ latitude, longitude, radius = 50, onChange }) => {
    // Default center: Hanoi layout
    const defaultCenter: [number, number] = [21.028511, 105.804817];
    const position: [number, number] = latitude !== undefined && longitude !== undefined
        ? [latitude, longitude]
        : defaultCenter;

    return (
        <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #d9d9d9', zIndex: 0 }}>
            {/* 
        Leaflet needs a fixed height. We use inline styling.
      */}
            <MapContainer
                center={position}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {(latitude !== undefined && longitude !== undefined) && (
                    <>
                        <Marker position={position} />
                        <Circle
                            center={position}
                            radius={radius}
                            pathOptions={{
                                color: '#1677ff',
                                fillColor: '#1677ff',
                                fillOpacity: 0.25
                            }}
                        />
                        <RecenterMap lat={latitude} lng={longitude} />
                    </>
                )}
                <MapEvents onChange={onChange} />
                <SearchField onChange={onChange} />
                <MapInvalidator />
            </MapContainer>
        </div>
    );
};

export default MapPicker;
