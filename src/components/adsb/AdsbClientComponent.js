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

function ResetButton({ initialLocation, initialZoom, isDarkMode }) {
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
                style={{ width: '25px', height: '25px' }}
            />
        </button>
    );
}

function ToggleButton({ toggleMapStyle, isDarkMode }) {
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
                style={{ width: '25px', height: '25px' }}
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

export default function AdsbClientComponent({ flights, adsbTime }) {
    const aerodome_location = [60.48075888598088, 26.59665436528449];
    const initial_location = [60.410626266897054, 22.867355506576178];
    const initial_zoom = 6;
    const [iconSize, setIconSize] = useState(16);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleMapStyle = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    useEffect(() => {
        const handleResize = () => {
            // Adjusts iconSize based on window width
            setIconSize(window.innerWidth / 53);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="relative w-full h-full">
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
                <Marker
                    position={aerodome_location}
                    icon={rotatedIcon(
                        isDarkMode
                            ? '/svgs/txrunit_yellow.svg'
                            : '/svgs/txrunit_black.svg',
                        0,
                        iconSize
                    )}
                >
                    <Tooltip
                        className="custom-tooltip"
                        direction="top"
                        offset={[0, -12]}
                        opacity={1}
                        permanent={true} // true: name always visible, false: shows while hovered
                    >
                        Helsinki East Aerodome
                    </Tooltip>
                </Marker>

                {flights.map((flight) => {
                    const isValidFlight =
                        flight.lat != null && flight.lon != null && flight.fli;

                    if (!isValidFlight) {
                        console.log('invalid flight data:', flight);
                        return null;
                    }

                    const rotation = flight.trk;
                    return (
                        <Marker
                            key={flight.hex}
                            position={[flight.lat, flight.lon]}
                            icon={rotatedIcon(
                                isDarkMode
                                    ? '/svgs/plane_yellow.svg'
                                    : '/svgs/plane_black.svg',
                                rotation,
                                iconSize
                            )}
                        >
                            <Tooltip
                                className="custom-tooltip"
                                direction="top"
                                offset={[0, -18]}
                                opacity={1}
                                permanent={true} // true: flight number always visible, false: shows while hovered
                            >
                                {flight.fli}
                            </Tooltip>

                            <Popup>
                                <h4 className="popup-h4">{flight.fli}</h4>
                                <div>
                                    Flight ID: {flight.hex}
                                    <br />
                                    Altitude: {flight.alt} feet
                                    <br />
                                    Speed: {flight.spd}
                                    <br />
                                    Heading: {flight.trk}
                                    <br />
                                    Category: {flight.cat}
                                    <br />
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <ToggleButton
                    toggleMapStyle={toggleMapStyle}
                    isDarkMode={isDarkMode}
                />
                <ResetButton
                    initialLocation={initial_location}
                    initialZoom={initial_zoom}
                    isDarkMode={isDarkMode}
                />
            </MapContainer>
        </div>
    );
}
