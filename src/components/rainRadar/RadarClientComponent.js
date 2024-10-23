'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
    const bounds = [
        [56.7513, 16.8674], // Southwest corner
        [70.9831, 37.3717], // Northeast corner
    ];

    useEffect(() => {
        if (data.length > 0) {
            const interval = setInterval(() => {
                setCurrentImageIndex(
                    (prevIndex) => (prevIndex + 1) % data.length
                );
            }, 1000); // Change image every 3 seconds
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
                    onError={() => {
                        setError(true);
                        console.error(
                            `Failed to load image at: ${data[currentImageIndex]}`
                        );
                    }}
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
