// components/camera/CameraServerComponent.js
import React, {useState, useEffect, useRef} from 'react';
import useSWR from 'swr';
import LoadingSpinner from '../LoadingSpinner'; // Import the LoadingSpinner component
import ErrorComponent from '../ErrorComponent'; // Import the ErrorComponent
import {fetcher} from '../../lib/fetcher'; // Import the fetcher function
import dynamic from 'next/dynamic'; // This is used to dynamically import the client-side component, meaning it will only be loaded on the client-side
import isEqual from 'lodash.isequal'; // Import the isEqual function, can be used to compare objects deeply

// Dynamic import for the client-side component, with server-side rendering disabled
const ExampleClientComponent = dynamic(
    () => import('./ExampleClientComponent'),
    {
        ssr: false,
    }
);
// Fake API address
const API_URL = 'https://jsonplaceholder.typicode.com/posts/6';

// The custom compare function to compare the current and new data
function compareData(currentData, newData) {
    return isEqual(currentData, newData);
}

export default function CameraServerComponent() {
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const previousDataRef = useRef(null); // Store the previous data
    const isFirstLoadRef = useRef(true); // Check if it's the first load

    const {data, error, isValidating} = useSWR(API_URL, fetcher, {
        refreshInterval: 60000, // Refresh data every 60 seconds
        revalidateIfStale: false, // Disable revalidation if data is stale
        revalidateOnFocus: false, // Disable revalidation on focus
        revalidateOnReconnect: false, // Disable revalidation on reconnect
        compare: compareData, // Use the custom compare function
        shouldRetryOnError: true, // Retry on error (default is true)
        errorRetryInterval: 5000, // Wait 5 seconds before retrying
        errorRetryCount: 3, // Retry up to 3 times
    });

    useEffect(() => {
        if (data) {
            // On initial load, used to prevent showing the loading spinner on first load
            if (isFirstLoadRef.current) {
                setIsLoading(false);
                isFirstLoadRef.current = false;
                previousDataRef.current = data;
                return;
            }

            // If data is being fetched and data has changed
            if (isValidating && !compareData(previousDataRef.current, data)) {
                setIsLoading(true);
                // After data is fetched and different
                const timer = setTimeout(() => {
                    setIsLoading(false);
                    previousDataRef.current = data;
                }, 500); // Adjust the delay as needed
                return () => clearTimeout(timer);
            }

            // If data is being fetched but data hasn't changed
            if (isValidating && compareData(previousDataRef.current, data)) {
                setIsLoading(false);
            }
        }
    }, [data, isValidating]);

    // Show error message if there's an error
    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    // Show loading spinner while loading
    if (isLoading || !data) {
        return <LoadingSpinner />;
    }

    // Pass the data to the client-side component, if needed, otherwise render the data here and delete the client-side component import
    return <ExampleClientComponent data={data} />;
}
