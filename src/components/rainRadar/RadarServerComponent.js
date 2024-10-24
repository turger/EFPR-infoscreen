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

    /* SWR fetching the radar images
    const { data, error } = useSWR('/api/fetchRadarImages', fetcher, {
        refreshInterval: 1000 * 60 * 10, // 10 minutes
        dedupingInterval: 1000 * 60 * 10,
    }); */

    // Function to send timestamps to the server every 10 minutes
    const sendTimestampsToAPI = async () => {
        const newTimestamps = generateRadarFrameTimestamps(12); // Generate the new timestamps for radar images

        try {
            const response = await fetch(
                '/api/processRadarImages', // Assuming the API route for processing images
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ timestamps: newTimestamps }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to send timestamps to processRadarImages API'
                );
            }

            const data = await response.json();
            setImagePaths(data.imagePaths); // Update the state with the latest image paths
        } catch (error) {
            setError(true);
        }
    };

    // Call the function every 10 minutes
    useEffect(() => {
        sendTimestampsToAPI(); // Call it on initial load

        const intervalId = setInterval(sendTimestampsToAPI, 600000); // Every 10 minutes

        return () => clearInterval(intervalId); // Clean up the interval on unmount
    }, []);

    if (!imagePaths) {
        return <LoadingSpinner />; // Show loading spinner while fetching
    }

    if (error) {
        return <ErrorComponent message={error.message} />; // Show error component if there's an error
    }

    // Pass imagePaths to the RadarClientComponent
    return (
        <div>
            <h1 className="text-white text-xl">Rain Radar</h1>
            <RadarClientComponent data={imagePaths} />
        </div>
    );
}
