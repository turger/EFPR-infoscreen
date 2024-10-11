// AdsbClientComponent.js
'use client';
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    Tooltip,
    Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
function ResetButton({ initialLocation, initialZoom }) {
    const map = useMap();
    const resetMap = () => {
        map.setView(initialLocation, initialZoom);
    };

    return (
        <button
            onClick={resetMap}
            style={{
                position: 'absolute',
                right: '5px',
                bottom: '30px',
                zIndex: 1000,
                padding: '5px 10px',
                backgroundColor: '#fac807',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
            }}
        >
            Reset Map
        </button>
    );
}

function ToggleButton({ toggleMapStyle }) {
    return (
        <button
            onClick={toggleMapStyle}
            style={{
                position: 'absolute',
                right: '5px',
                bottom: '60px',
                zIndex: 1000,
                padding: '5px 10px',
                backgroundColor: '#fac807',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
            }}
        >
            Change mode
        </button>
    );
}

export default function AdsbClientComponent({ data }) {
    const placeholderData = data;
    const initial_location = [60.410626266897054, 22.867355506576178];
    const initial_zoom = 7;
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleMapStyle = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    return (
        <MapContainer
            center={initial_location}
            zoom={initial_zoom}
            style={{ height: '100%', width: '100%' }}
        >
            {isDarkMode ? (
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & CartoDB'
                />
            ) : (
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
            )}
            <ToggleButton toggleMapStyle={toggleMapStyle} />
            <ResetButton
                initialLocation={initial_location}
                initialZoom={initial_zoom}
            />
        </MapContainer>
    );
}
