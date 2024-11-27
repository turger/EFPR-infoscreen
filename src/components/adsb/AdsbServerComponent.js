import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';
import { useData } from '@/lib/DataContext';

/* const AdsbClientComponent = dynamic(() => import('./AdsbClientComponent'), {
    ssr: false,
}); */

const MapComponent = dynamic(
    () => import('../reactLeafletMap/ReactLeafletMap'),
    {
        ssr: false,
    }
);

export default function AdsbServerComponent() {
    /* ADS-B data is fetched in lib/DataContext.js */
    const { adsbData, adsbError } = useData();
    /*     const { data: adsbData, error: adsbError } = useSWR('/api/adsb', fetcher, {
            refreshInterval: 4000, // 4 seconds
            dedupingInterval: 4000, // Prevent SWR from sending multiple requests at the same time
        }); */

    const { data: airspacesData, error: airspacesError } = useSWR(
        '/api/airspaces',
        fetcher,
        {
            refreshInterval: 60000, // 60 seconds
            dedupingInterval: 60000,
        }
    );

    const [flights, setFlights] = useState([]);
    const [adsbTime, setAdsbTime] = useState('--:--:--');
    const [isLoading, setIsLoading] = useState(true);
    const aerodomeLocation = [60.48075888598088, 26.59665436528449];
    const initialLocation = [61.1, 23.0];
    const initialZoom = 6;

    // Adjusts time (JSON time -3h)
    const getFinnishTime = (timestamp) => {
        const formattedTimestamp = `${timestamp.replace(' ', 'T')}Z`;
        const date = new Date(formattedTimestamp);
        if (isNaN(date.getTime())) {
            return '--:--:--';
        }
        const finnishTime = new Intl.DateTimeFormat('fi-FI', {
            timeZone: 'Europe/Helsinki',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
        return finnishTime;
    };

    // Handles filtering flights and sets adsbTime when ADS-B data changes
    useEffect(() => {
        if (adsbData && Array.isArray(adsbData)) {
            const uniqueFlights = adsbData.filter(
                (flight, index, self) =>
                    index === self.findIndex((f) => f.hex === flight.hex)
            );

            setFlights(uniqueFlights);

            if (uniqueFlights.length > 0 && uniqueFlights[0].tim) {
                const adjustedTime = getFinnishTime(uniqueFlights[0].dat);
                setAdsbTime(adjustedTime);
            }
            setIsLoading(false);
        }
    }, [adsbData]);

    // Loading and error handling
    if (adsbError || airspacesError) {
        return (
            <ErrorComponent
                message={adsbError?.message || airspacesError?.message}
            />
        );
    }
    if (isLoading || !adsbData || !airspacesData) {
        return <LoadingSpinner />;
    }
    return (
        <>
            <div>
                {/* <p className="text-white text-sm">
                    ADS-B - Flights And Airspaces - {adsbTime}
                </p> */}
                {/*  <AdsbClientComponent
                flights={flights}
                airspaces={airspacesData.features}
                /> */}
                <MapComponent
                    aerodomeLocation={aerodomeLocation}
                    initialLocation={initialLocation}
                    flights={flights}
                    airspaces={airspacesData.features}
                    initialZoom={initialZoom}
                />
            </div>
            <div className="flex justify-between items-end text-xs">
                {/* Bottom left: Last updated */}
                <p className="text-gray-400">Last updated: {adsbTime}</p>

                {/* Bottom right: ADS-B, AUP/UUP */}
                <p className="text-gray-400">
                    ADS-B Data from:{' '}
                    <a href="https://www.xamk.fi/" className="text-blue-400">
                        XAMK
                    </a>
                    , AUP/UUP{' '}
                    <a href="https://flyk.com" className="text-blue-400">
                        Flyk.com
                    </a>
                </p>
            </div>
        </>
    );
}
