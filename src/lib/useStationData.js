import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function useStationData() {
    const [lastUpdated, setLastUpdated] = useState(null);

    const { data, error } = useSWR('/api/runway', fetcher, {
        refreshInterval: 600000, // Refresh every 10 minute
    });

    useEffect(() => {
        if (data) {
            setLastUpdated(new Date());
        }
    }, [data]);

    return {
        stationData: data,
        isLoading: !error && !data,
        isError: error,
        lastUpdated,
    };
}
