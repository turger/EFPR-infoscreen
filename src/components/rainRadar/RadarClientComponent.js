'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4'; // Import proj4
import { projectionBounds } from '@/lib/fmiQueryData';

// Defines the projections
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
    const [timestamps, setTimestamps] = useState([]);

    // Extracts URLs and timestamps from the data
    useEffect(() => {
        if (data.length > 0) {
            const generatedTimestamps = data.map((item) => item.timestamp); // Extract timestamps
            setTimestamps(generatedTimestamps);
        }
    }, [data]);

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
        if (data.length === 0) return;

        // Function to advance the image index
        const advanceImage = () => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % data.length);
        };

        // Set an interval to change the image every 2 seconds
        const intervalId = setInterval(advanceImage, 2000);

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, [data]);

    const initialLocation = [61.1, 23.0];
    const initialZoom = 6;

    const getFinnishTime = (timestamp) => {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            return 'Invalid time'; // or return an empty string
        }

        const finnishTime = new Intl.DateTimeFormat('fi-FI', {
            timeZone: 'Europe/Helsinki',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);

        return finnishTime;
    };

    return (
        <MapContainer
            center={initialLocation}
            zoom={initialZoom}
            style={{ height: '40vh', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & CartoDB'
            />

            {data.length > 0 && (
                <ImageOverlay
                    key={data[currentImageIndex].url}
                    url={data[currentImageIndex].url}
                    bounds={bounds}
                />
            )}

            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    backgroundColor: 'white',
                    padding: '5px',
                    borderRadius: '5px',
                    color: '#000',
                    fontWeight: 'bold',
                }}
            >
                {timestamps[currentImageIndex] && (
                    <div>{getFinnishTime(timestamps[currentImageIndex])}</div>
                )}
            </div>

            <ResetButton
                initialLocation={initialLocation}
                initialZoom={initialZoom}
            />
        </MapContainer>
    );
}
