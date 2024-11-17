import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';
import { generateRadarFrameTimestamps } from '@/lib/fmiQueryData';

const RadarClientComponent = dynamic(() => import('./RadarClientComponent'), {
    ssr: false,
});

export default function RadarServerComponent() {
    const [imagePaths, setImagePaths] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [hasFetched, setHasFetched] = useState(false); // Flag to track if data has been fetched

    // Function to send timestamps to the server every 10 minutes
    const sendTimestampsToAPI = async () => {
        setError(false);
        const newTimestamps = generateRadarFrameTimestamps(12); // Generate the new timestamps for radar images,

        try {
            setIsLoading(true);
            const response = await fetch('/api/processRadarImages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ timestamps: newTimestamps }),
            });

            if (!response.ok) {
                throw new Error(
                    'Failed to send timestamps to processRadarImages API'
                );
            }

            const data = await response.json();
            setImagePaths(data.imagePaths);
            setIsLoading(false);
            setHasFetched(true);
        } catch (error) {
            setError(true);
        }
    };

    // Call the function every 10 minutes
    useEffect(() => {
        if (!hasFetched) {
            sendTimestampsToAPI(); // Call it on initial load
        }

        // Interval, change first number to change minutes
        const intervalId = setInterval(
            () => {
                if (hasFetched) {
                    sendTimestampsToAPI(); // Called only if the initial fetch has completed
                }
            },
            5 * 60 * 1000
        );

        return () => clearInterval(intervalId); // Clean up the interval on unmount
    }, [hasFetched]);

    // Function to trigger blob deletion every hour
    const deleteOldBlobs = async () => {
        try {
            const response = await fetch('/api/deleteBlobs', {
                method: 'DELETE',
            });

            if (!response.ok) {
                console.error('Failed to delete old blobs.');
            } else {
                console.log('Old blobs deleted successfully.');
            }
        } catch (error) {
            console.error('Error deleting old blobs:', error);
        }
    };

    // Call the blob deletion function every hour
    useEffect(() => {
        deleteOldBlobs(); // Call it on initial load

        const deleteInterval = setInterval(
            () => {
                deleteOldBlobs();
            },
            60 * 60 * 1000
        ); // Run every hour

        return () => clearInterval(deleteInterval); // Clean up the interval on unmount
    }, []);

    if (!imagePaths || isLoading) {
        return <LoadingSpinner />; // Show loading spinner while fetching
    }

    if (error) {
        return <ErrorComponent message={error.message} />; // Show error component if there's an error
    }

    // Pass imagePaths to the RadarClientComponent
    return (
        <div>
            <h1 className="text-white text-sm">Rain Radar</h1>
            <RadarClientComponent data={imagePaths} />
        </div>
    );
}
