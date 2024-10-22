// AdsbServerComponent.js
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { FaExclamationTriangle } from 'react-icons/fa';
import { fetcher } from '@/lib/fetcher';

const AdsbClientComponent = dynamic(() => import('./AdsbClientComponent'), {
    ssr: false,
});

// const API_URL = 'https://jsonplaceholder.typicode.com/posts/4';

export default function AdsbServerComponent() {
    /* const { data, error, isValidating } = useSWR(API_URL, fetcher, {
        refreshInterval: 60000,
    }); */

    const [isLoading, setIsLoading] = useState(true);
    const [adsbTime, setAdsbTime] = useState('--:--:--');
    const [flights, setFlights] = useState([]);

    const adjustTime = (timeString) => {
        let [hours, minutes, seconds] = timeString.split(':').map(Number);
        hours = (hours + 3) % 24; // time -3h in JSON data
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const fetchAdsbData = async () => {
        try {
            const response = await fetch('/api/adsb');
            const result = await response.json();

            if (response.ok && result.length > 0) {
                const uniqueFlights = result.filter(
                    (flight, index, self) =>
                        index === self.findIndex((f) => f.hex === flight.hex)
                );

                setFlights(uniqueFlights);

                const timeZoneOffSet = result[0].tim.slice(0, 8);
                const adjustedTime = adjustTime(timeZoneOffSet);
                setAdsbTime(adjustedTime);
            } else {
                console.warn('ADS-B data response empty/not ok');
            }
        } catch (error) {
            console.error('Error fetching ADS-B data: ', error);
        }
    };

    useEffect(() => {
        fetchAdsbData();
        const intervalADSB = setInterval(fetchAdsbData, 3000);
        return () => clearInterval(intervalADSB);
    }, []);

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
            <p className="text-white text-sm">ADS-B {adsbTime}</p>
            {/* <AdsbClientComponent data={data} /> */}
            <AdsbClientComponent flights={flights} adsbTime={adsbTime} />
        </>
    );
}
