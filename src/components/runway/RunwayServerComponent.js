import dynamic from 'next/dynamic';
import useWeatherData from '@/lib/weatherData';
import useStationData from '@/lib/useStationData';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';

const RunwayClientComponent = dynamic(() => import('./RunwayClientComponent'), {
    ssr: false,
});

export default function RunwayServerComponent() {
    const {
        weatherData,
        isLoading: weatherLoading,
        isError: weatherError,
    } = useWeatherData();
    const {
        stationData,
        isLoading: stationLoading,
        isError: stationError,
        lastUpdated: stationLastUpdated,
    } = useStationData();

    if (weatherLoading || stationLoading) return <LoadingSpinner />;
    if (weatherError || stationError || !weatherData || !stationData)
        return <ErrorComponent message="Failed to load data" />;

    const windDirection = weatherData.observation.windDirectionOBSERVATION;
    const wind = weatherData.observation.WindOBSERVATION;

    const stationsData = Object.keys(stationData.stations).map((stationId) => {
        const station = stationData.stations[stationId][0];
        const site = station[8][0];
        return {
            id: stationId,
            name: station[1],
            temp: station[6],
            condition: station[5],
            siteId: site.site_id,
        };
    });

    return (
        <RunwayClientComponent
            windDirection={windDirection}
            wind={wind}
            data={stationsData}
            stationLastUpdated={stationLastUpdated}
        />
    );
}
