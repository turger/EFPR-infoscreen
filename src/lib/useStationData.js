import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function useStationData() {
    const { data, error } = useSWR('/api/runway', fetcher, {
        refreshInterval: 60000, // Refresh every 1 minute
    });

    return {
        stationData: data,
        isLoading: !error && !data,
        isError: error,
    };
}