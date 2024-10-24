'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4'; // Import proj4
import { projectionBounds } from '@/lib/fmiQueryData';

// Define the projections
proj4.defs([
    [
        'EPSG:3857',
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +no_defs',
    ],
    ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
]);

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
                bottom: '20px',
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

export default function RadarClientComponent({ data }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [error, setError] = useState(false);

    // Convert EPSG:3857 bounds to EPSG:4326
    const sw = proj4('EPSG:3857', 'EPSG:4326', [
        projectionBounds[0],
        projectionBounds[1],
    ]);
    const ne = proj4('EPSG:3857', 'EPSG:4326', [
        projectionBounds[2],
        projectionBounds[3],
    ]);

    // Create bounds for Leaflet
    const bounds = [
        [sw[1], sw[0]], // SW corner (lat, lon)
        [ne[1], ne[0]], // NE corner (lat, lon)
    ];

    useEffect(() => {
        if (data.length > 0) {
            const interval = setInterval(() => {
                setCurrentImageIndex(
                    (prevIndex) => (prevIndex + 1) % data.length
                );
            }, 3000); // Change image every 3 seconds
            return () => clearInterval(interval);
        }
    }, [data.length]);

    const initialLocation = [60.518742, 26.398944];
    const initialZoom = 7;

    return (
        <MapContainer
            center={initialLocation}
            zoom={initialZoom}
            style={{ height: '100vh', width: '100%' }} // Adjust height for full viewport
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & CartoDB'
            />

            {data.length > 0 && !error && (
                <ImageOverlay
                    key={data[currentImageIndex]}
                    url={data[currentImageIndex]}
                    bounds={bounds}
                />
            )}

            {error && (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 1000,
                        top: '10px',
                        left: '10px',
                        backgroundColor: 'white',
                        padding: '5px',
                        borderRadius: '5px',
                    }}
                >
                    Error loading image. Please try again later.
                </div>
            )}

            <ResetButton
                initialLocation={initialLocation}
                initialZoom={initialZoom}
            />
        </MapContainer>
    );
}
