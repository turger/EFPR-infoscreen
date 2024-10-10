'use client';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, ImageOverlay } from 'react-leaflet';
//import { EPSG3067 } from '../common/crs';
import 'leaflet/dist/leaflet.css';
//import L from 'leaflet';

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
/*
const rotatedIcon = (iconUrl, rotation, iconSize) => {
    const size = iconSize;
    const anchor = size / 2;
    return L.divIcon({
        className: 'custom-icon',
        html: `<img src="${iconUrl}" style="transform: rotate(${rotation}deg); width: ${size}px; height: ${size}px;" />`,
        iconSize: [size, size],
        iconAnchor: [anchor, anchor],
        popupAnchor: [0, -anchor],
    });
}; */

export default function RadarClientComponent({ data }) {
    //const [iconSize, setIconSize] = useState(2);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const bounds = [
        [56.85132, 15.99743], // Southwest corner
        [71.0, 33.9], // Northeast corner
    ];

    useEffect(() => {
        if (data.length > 0) {
            setIsLoading(false);
            const interval = setInterval(() => {
                setCurrentImageIndex(
                    (prevIndex) => (prevIndex + 1) % data.length
                );
            }, 1000); // Change image every second
            return () => clearInterval(interval);
        }
    }, [data.length]);

    /*useEffect(() => {
        console.log('Current Image Index:', currentImageIndex);
        console.log('Image URL:', data[currentImageIndex]?.url); // Check if URL exists
    }, [currentImageIndex, data]); */
    /*useEffect(() => {
        const handleResize = () => {
            setIconSize(window.innerWidth / 45);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); */

    //const aerodomeLocation = [60.48075888598088, 26.59665436528449];
    const initialLocation = [60.518742, 26.398944];
    const initialZoom = 7;

    if (isLoading) {
        return <div>Loading map...</div>;
    }

    return (
        <MapContainer
            center={initialLocation}
            zoom={initialZoom}
            style={{ height: '100%', width: '100%' }}
            //crs={EPSG3067}
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
                    //opacity={0.7}
                />
            )}
            {/* 
             <Marker
                position={aerodomeLocation}
                icon={rotatedIcon('/svgs/txrunit_yellow.svg', 0, iconSize)}
            >
                <Tooltip
                    className="custom-tooltip"
                    direction="top"
                    offset={[0, -12]}
                    opacity={1}
                    permanent={false}
                >
                    Helsinki East Aerodome
                </Tooltip>
            </Marker>

            */}

            <ResetButton
                initialLocation={initialLocation}
                initialZoom={initialZoom}
            />
        </MapContainer>
    );
}
