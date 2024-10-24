import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';

const RunwayClientComponent = dynamic(() => import('./RunwayClientComponent'), {
    ssr: false,
});

export default function RunwayServerComponent() {
    const { data, error } = useSWR('/api/runway', fetcher, {
        refreshInterval: 60000, // 60 seconds
        dedupingInterval: 60000, // Prevent SWR from sending multiple requests at the same time
    });

    if (error) return <ErrorComponent message="Failed to load data" />;
    if (!data) return <LoadingSpinner />;

    const stationsData = Object.keys(data.stations).map(stationId => {
        const station = data.stations[stationId][0];
        const site = station[8][0];
        return {
            id: stationId,
            name: station[1],
            temp: station[6],
            condition: station[5],
            siteId: site.site_id,
        };
    });

    return <RunwayClientComponent data={stationsData} />;
}