// src/components/notam/NotamClientComponent.js
'use client';

import { useEffect, useState } from 'react';

export default function NotamClientComponent() {
    const [notam, setNotam] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState('');

    // Function to retrieve NOTAM data
    async function fetchNotam() {
        try {
            const response = await fetch('http://localhost:3000/api/notams', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-store',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch NOTAM data');
            }

            const jsonData = await response.json();

            // Update NOTAM data and last update time
            setNotam(jsonData.data);
            setLastUpdated(new Date()); // Set the new latest update time to the current time
            setError(null);
        } catch (error) {
            setError('Error loading NOTAM data');
        }
    }

    // Update the "Last updated" time text
    const updateTimeSinceLastUpdate = () => {
        if (lastUpdated) {
            const now = new Date();
            const diff = Math.floor((now - lastUpdated) / 1000); // Difference in seconds
            const minutes = Math.floor(diff / 60);
            const hours = Math.floor(minutes / 60);

            if (hours >= 1) {
                // When the full hour is reached, lastUpdated is updated and the couter is reset
                fetchNotam();
            } else if (minutes >= 1) {
                // Display the number of minutes
                setTimeSinceLastUpdate(`${minutes} minute(s) ago`);
            } else {
                // Number of seconds displayed
                setTimeSinceLastUpdate(`${diff} second(s) ago`);
            }
        } else {
            setTimeSinceLastUpdate('Not updated');
        }
    };

    // Retrieve NOTAM data for the first time and set the update interval every hour
    useEffect(() => {
        fetchNotam();
        const intervalId = setInterval(fetchNotam, 3600000); // Data updated every hour
        return () => clearInterval(intervalId);
    }, []);

    // Updates the "Last updated" time every second
    useEffect(() => {
        const intervalId = setInterval(updateTimeSinceLastUpdate, 1000);
        return () => clearInterval(intervalId);
    }, [lastUpdated]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!notam) {
        return <div>Loading NOTAM data...</div>;
    }

    return (
        <div style={{ fontSize: '0.75rem' }}>
            <pre>{notam.title}</pre>
            <pre>{notam.content}</pre>
            <p>Last updated: {timeSinceLastUpdate}</p>
        </div>
    );
}
