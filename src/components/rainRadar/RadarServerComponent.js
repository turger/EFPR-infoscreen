import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';

const RadarClientComponent = dynamic(() => import('./RadarClientComponent'), {
    ssr: false,
});

export default function RadarServerComponent() {
    const [imagePaths, setImagePaths] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRadarImages = async () => {
            try {
                // Fetch the radar images from the server-side API
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_RADAR_URL}/api/processRadarImages`,
                    {
                        cache: 'no-store', // Ensure fresh data
                    }
                );

                // Ensure the API call was successful
                if (!res.ok) {
                    throw new Error('Failed to fetch radar images');
                }

                const data = await res.json();
                setImagePaths(data.imagePaths); // Set the image paths from the response
                setIsLoading(false);
            } catch (error) {
                setError('Could not create imagePaths: ' + error.message);
                setIsLoading(false); // Stop loading on error
            }
        };

        // Call the function immediately when the component mounts
        fetchRadarImages();

        // Set up an interval to fetch data every 10 minutes (600,000 milliseconds)
        const intervalId = setInterval(fetchRadarImages, 600000);

        // Clean up the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures this effect runs only once when the component mounts

    // Loading and error handling
    if (error) {
        return <ErrorComponent message={error} />;
    }
    if (isLoading || !imagePaths) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <h1 className="text-white text-xl">Rain Radar</h1>
            <RadarClientComponent data={imagePaths} />
        </div>
    );
}
