import React, {useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';
import {
    generateRadarFrameTimestamps,
    requestRainRadar,
} from '@/lib/fmiQueryData';
import styles from './radar.module.css';

const RadarClientComponent = dynamic(() => import('./RadarClientComponent'), {
    ssr: false,
});

export default function RadarServerComponent() {
    const [imagePaths, setImagePaths] = useState([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRadarImages = async () => {
            try {
                const timestamps = generateRadarFrameTimestamps(12);
                // Generate radar image URLs based on the received timestamps
                const urls = timestamps.map((time) => {
                    const config = requestRainRadar(time);
                    return `${config.url}?${new URLSearchParams(config.params).toString()}`;
                });

                setImagePaths(urls);
            } catch (error) {
                setError(error);
                throw new Error(error);
            }
        };
        fetchRadarImages();
    }, []);

    if (!imagePaths) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    // Pass imagePaths to the RadarClientComponent
    return (
        <div className={styles.radarContainer}>
            <RadarClientComponent data={imagePaths} />

            <div className="flex justify-between items-end">
                <p className={styles.radarFooter}>
                    Rain radar Images from:{' '}
                    <a
                        href="https://en.ilmatieteenlaitos.fi/open-data"
                        className="text-blue-400"
                    >
                        FMIOpenData
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
