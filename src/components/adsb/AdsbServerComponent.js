import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';

const AdsbClientComponent = dynamic(() => import('./AdsbClientComponent'), {
    ssr: false,
});

export default function AdsbServerComponent() {
    const { data, error } = useSWR('/api/adsb', fetcher, {
        refreshInterval: 4000, // 4 seconds
        dedupingInterval: 4000, // Prevent SWR from sending multiple requests at the same time
    });

    const [flights, setFlights] = useState([]);
    const [adsbTime, setAdsbTime] = useState('--:--:--');
    const [isLoading, setIsLoading] = useState(true);

    // Adjusts time (JSON time -3h)
    const adjustTime = (timeString) => {
        let [hours, minutes, seconds] = timeString.split(':').map(Number);
        hours = (hours + 3) % 24;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Handles filtering flights and sets adsbTime when ADS-B data changes
    useEffect(() => {
        if (data && Array.isArray(data)) {
            const uniqueFlights = data.filter(
                (flight, index, self) =>
                    index === self.findIndex((f) => f.hex === flight.hex)
            );

            setFlights(uniqueFlights);

            if (uniqueFlights.length > 0 && uniqueFlights[0].tim) {
                const timeZoneOffSet = uniqueFlights[0].tim.slice(0, 8);
                const adjustedTime = adjustTime(timeZoneOffSet);
                setAdsbTime(adjustedTime);
            }
            setIsLoading(false);
        }
    }, [data]);

    // Loading and error handling
    if (error) {
        return <ErrorComponent message={error.message} />;
    }
    if (isLoading || !data) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <p className="text-white text-sm">ADS-B {adsbTime}</p>
            <AdsbClientComponent flights={flights} />
        </>
    );
}