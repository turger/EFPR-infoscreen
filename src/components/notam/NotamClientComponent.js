// src/components/notam/NotamClientComponent.js
'use client';

import { useEffect, useRef, useState } from 'react';

export default function NotamClientComponent() {
    const [notam, setNotam] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState('');

    // Function to retrieve NOTAM data
    async function fetchNotam() {
        try {
            const response = await fetch('/api/notams', {
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

    // autoscroll feature if the notams overflow the div
    const scrollContainerRef = useRef(null);
    const [maxHeight, setMaxHeight] = useState(0);
    const [maxScreenWidth, setMaxScreenWidth] = useState(0);
    const [maxScreenHeight, setMaxScreenHeight] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMaxScreenWidth(window.screen.width);
            setMaxScreenHeight(window.screen.height);
        }
    }, []);

    // Calculate max height dynamically
    useEffect(() => {
        if (scrollContainerRef.current) {
            const parentHeight = scrollContainerRef.current.clientHeight;
            setMaxHeight(parentHeight); // Subtract footer or padding height
        }
    }, [scrollContainerRef.current?.clientHeight]);

    useEffect(() => {
        scrollToBottom();
    }, [notam]);

    const scrollToBottom = () => {
        //scrollContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
        scrollContainerRef.current?.scrollTo({
            top: scrollContainerRef.current?.scrollHeight,
            left: 0,
            behavior: 'smooth',
        });
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!notam) {
        return <div>Loading NOTAM data...</div>;
    }

    return (
        <div className="flex flex-col h-full w-full max-h-[30vh]">
            {/* Main content area */}
            <div className="flex-grow overflow-auto p-2">
                <pre className="text-sm">{notam.content}</pre>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end text-xs p-2">
                {/* Bottom left: Last updated */}
                <p className="text-gray-400">
                    Last updated: {timeSinceLastUpdate}
                </p>

                {/* Bottom right: CC BY 4.0 */}
                <p className="text-gray-400">
                    NOTAM Data from:{' '}
                    <a
                        href="https://lentopaikat.fi/notam/notam.php?a=EFPR"
                        className="text-blue-400"
                    >
                        lentopaikat.fi
                    </a>
                    ,{' '}
                    <a
                        href="https://creativecommons.org/licenses/by/4.0/"
                        className="text-blue-400"
                    >
                        CC BY 4.0
                    </a>
                </p>
            </div>
        </div>
    );
}
