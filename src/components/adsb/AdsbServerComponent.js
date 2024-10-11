// AdsbServerComponent.js
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { FaExclamationTriangle } from 'react-icons/fa';
import { fetcher } from '@/lib/fetcher';

const AdsbClientComponent = dynamic(() => import('./AdsbClientComponent'), {
    ssr: false,
});

const API_URL = 'https://jsonplaceholder.typicode.com/posts/4';

export default function AdsbServerComponent() {
    /* const { data, error, isValidating } = useSWR(API_URL, fetcher, {
        refreshInterval: 60000,
    }); */
    const [isLoading, setIsLoading] = useState(true);

    /* useEffect(() => {
        if (isValidating) {
            setIsLoading(true);
        } else {
            const timer = setTimeout(() => setIsLoading(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [isValidating]);

    if (error) {
        return (
            <div className="p-6 rounded-lg shadow-lg flex items-center justify-center h-full">
                <FaExclamationTriangle className="text-red-500 text-3xl" />
            </div>
        );
    }

    if (isLoading || !data) {
        return (
            <div className="p-6 rounded-lg shadow-lg flex items-center justify-center h-full">
                <svg
                    className="animate-spin h-10 w-10 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                </svg>
            </div>
        );
    } */

    return (
        <>
            <p className="text-white text-xl">ADS-B</p>
            {/* <AdsbClientComponent data={data} /> */}
            <AdsbClientComponent />
        </>
    );
}

