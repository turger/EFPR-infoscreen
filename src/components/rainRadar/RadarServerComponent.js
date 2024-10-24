import dynamic from 'next/dynamic';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

const RadarClientComponent = dynamic(() => import('./RadarClientComponent'), {
    ssr: false,
});

export default function RadarServerComponent() {
    const { data, error } = useSWR('/api/processRadarImages', fetcher, {
        refreshInterval: 1000 * 60 * 10, // 10 minutes
        dedupingInterval: 1000 * 60 * 10,
    });

    if (!data) {
        return <LoadingSpinner />; // Show loading spinner while fetching
    }

    if (error) {
        return <ErrorComponent message={error.message} />; // Show error component if there's an error
    }

    // Pass imagePaths to the RadarClientComponent
    return (
        <div>
            <h1 className="text-white text-xl">Rain Radar</h1>
            <RadarClientComponent data={data.imagePaths} />
        </div>
    );
}
