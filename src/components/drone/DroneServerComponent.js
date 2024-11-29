/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';
import { useData } from '@/lib/DataContext';

const MapComponent = dynamic(
    () => import('../reactLeafletMap/ReactLeafletMap'),
    {
        ssr: false,
    }
);

export default function DroneServerComponent() {
    const { adsbData, adsbError } = useData();

    const [drones, setDrones] = useState([]);
    const [adsbTime, setAdsbTime] = useState('--:--:--');
    const [isLoading, setIsLoading] = useState(true);
    const aerodomeLocation = [60.48075888598088, 26.59665436528449];
    const initialLocation = [60.48075888598088, 26.59665436528449];
    const initialZoom = 12;

    /*     const droneTest = [
            {
                uti: 1731424917,
                dat: '2024-11-12 15:21:57.808524199',
                tim: '15:21:57.808524199',
                hex: '4601f9',
                fli: 'FIN1DK',
                lat: 60.48756408691406,
                lon: 24.65729812095905,
                gda: 'A',
                src: 'A',
                alt: 8925,
                altg: 9075,
                hgt: 150,
                spd: 177,
                cat: 'O13',
                squ: '0260',
                vrt: 1344,
                trk: 335.0221,
                mop: 2,
                lla: 1,
                tru: 1073,
                dbm: -73,
            },
            {
                uti: 1731424917,
                dat: '2024-11-12 15:21:57.834322159',
                tim: '15:21:57.834322159',
                hex: '342211',
                fli: 'FIN08PL',
                lat: 59.766815185546875,
                lon: 22.7076416015625,
                gda: 'A',
                src: 'RID',
                alt: 21875,
                altg: 21875,
                hgt: 0,
                spd: 441,
                cat: 'A3',
                squ: '3531',
                vrt: 1280,
                trk: 241.46202,
                mop: 2,
                lla: 1,
                tru: 2343,
                dbm: -90,
            },
        ]; */

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

    // Handles filtering drones from all flights and sets adsbTime when ADS-B data changes
    useEffect(() => {
        if (adsbData && Array.isArray(adsbData)) {
            const uniqueDrones = adsbData.filter(
                (flight, index, self) =>
                    (flight.src === 'RID' ||
                        flight.cat === 'B7' ||
                        flight.cat === 'O13') &&
                    flight.lat != null &&
                    flight.lon != null &&
                    index ===
                        self.findIndex(
                            (f) =>
                                (f.src === flight.src ||
                                    f.cat === flight.cat) &&
                                f.lat === flight.lat &&
                                f.lon === flight.lon
                        )
            );

            setDrones(uniqueDrones);

            if (uniqueDrones.length > 0 && uniqueDrones[0].tim) {
                const adjustedTime = getFinnishTime(uniqueDrones[0].dat);
                setAdsbTime(adjustedTime);
            }
            setIsLoading(false);
        }
    }, [adsbData]);

    // Loading and error handling
    if (adsbError) {
        return <ErrorComponent message={adsbError?.message} />;
    }
    if (isLoading || !adsbData) {
        return <LoadingSpinner />;
    }
    return (
        <div>
            <MapComponent
                aerodomeLocation={aerodomeLocation}
                initialLocation={initialLocation}
                flights={drones}
                initialZoom={initialZoom}
                mapHeight="34vh"
                isDarkMode={false}
            />

            {/* Footer */}
            <div className="flex justify-between items-end text-xs">
                <p className="text-gray-400">
                    {adsbTime === '--:--:--'
                        ? 'No drones'
                        : `Last updated: ${adsbTime}`}
                </p>

                <p className="text-gray-400">
                    ADS-B Data from:{' '}
                    <a href="https://www.xamk.fi/" className="text-blue-400">
                        XAMK
                    </a>
                    ,{' '}
                    <a href="https://avionix.eu/" className="text-blue-400">
                        Avionix
                    </a>
                </p>
            </div>
        </div>
    );
}
