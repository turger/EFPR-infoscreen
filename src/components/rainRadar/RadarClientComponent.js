'use client';

import React, {useState, useEffect} from 'react';
import {
    MapContainer,
    TileLayer,
    ImageOverlay,
    useMap,
    Marker,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4'; // Import proj4
import {projectionBounds} from '@/lib/fmiQueryData';

// Defines the projections
proj4.defs([
    [
        'EPSG:3857',
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +no_defs',
    ],
    ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs'],
]);

function ResetButton({initialLocation, initialZoom, isDarkMode}) {
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
                //backgroundColor: '#fac807',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
            }}
        >
            <img
                src={
                    isDarkMode
                        ? '/svgs/resetmap_yellow.svg'
                        : '/svgs/resetmap_black.svg'
                }
                alt="Reset Map"
                style={{width: '25px', height: '25px'}}
            />
        </button>
    );
}

function ToggleButton({toggleMapStyle, isDarkMode}) {
    return (
        <button
            onClick={toggleMapStyle}
            style={{
                position: 'absolute',
                right: '5px',
                bottom: '60px',
                zIndex: 1000,
                padding: '5px 10px',
                //backgroundColor: '#fac807',
                color: 'white',
                border: '3px',
                borderRadius: '30px',
                cursor: 'pointer',
            }}
        >
            <img
                src={
                    isDarkMode
                        ? '/svgs/mode_yellow.svg'
                        : '/svgs/mode_black.svg'
                }
                alt="Change Mode"
                style={{width: '25px', height: '25px'}}
            />
        </button>
    );
}

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
};

export default function RadarClientComponent({data}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [timestamps, setTimestamps] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const aerodome_location = [60.48075888598088, 26.59665436528449];
    // Not centered on aerodrome, to show rain from west and south better
    const initialLocation = [60.81462, 24.42146];
    // Bigger number means closer zoom
    const initialZoom = 6.1;
    const [iconSize, setIconSize] = useState(5);

    const toggleMapStyle = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    // Extracts URLs and timestamps from the data
    useEffect(() => {
        if (data.length > 0) {
            const generatedTimestamps = data.map((url) => {
                const timeParam = new URL(url).searchParams.get('time');
                return timeParam ? decodeURIComponent(timeParam) : null;
            });
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
        //Adds a delay of either 4 sec for last image or 1 for others.
        const delay = currentImageIndex === data.length - 1 ? 4000 : 1000;

        // Set an interval to change the image according to delay
        const timeoutId = setTimeout(advanceImage, delay);
        // Clear interval on component unmount
        return () => clearTimeout(timeoutId);
    }, [currentImageIndex, data]);

    useEffect(() => {
        const handleResize = () => {
            // Adjusts iconSize based on window width
            setIconSize(window.innerWidth / 180);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const getFinnishTime = (timestamp) => {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            return '';
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
            style={{height: '42vh', width: '100%'}}
            zoomSnap={0.1}
        >
            <TileLayer
                key={isDarkMode ? 'dark' : 'light'}
                url={
                    isDarkMode
                        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <Marker
                position={aerodome_location}
                icon={rotatedIcon(
                    isDarkMode
                        ? '/svgs/txrunit_yellow.svg'
                        : '/svgs/txrunit_black.svg',
                    0,
                    iconSize
                )}
            ></Marker>

            {data.length > 0 && (
                <ImageOverlay
                    key={`${data[currentImageIndex]}-${isDarkMode}`}
                    url={data[currentImageIndex]}
                    bounds={bounds}
                    opacity={0.45}
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

            <ToggleButton
                toggleMapStyle={toggleMapStyle}
                isDarkMode={isDarkMode}
            />
            <ResetButton
                initialLocation={initialLocation}
                initialZoom={initialZoom}
                isDarkMode={isDarkMode}
            />
        </MapContainer>
    );
}
