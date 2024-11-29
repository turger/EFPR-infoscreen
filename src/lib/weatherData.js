import useSWR from 'swr';
import observation from '@/pages/api/observation';
import fetchAndCalculateAverages from '@/pages/api/fetchForecast';

const fetcher = async () => {
    try {
        const observationData = await observation();
        const forecastData = await fetchAndCalculateAverages();

        if (forecastData && typeof forecastData === 'object') {
            if (observationData && typeof observationData === 'object') {
                return {
                    forecast: forecastData,
                    observation: observationData,
                };
            } else {
                console.error(
                    'Invalid observation data received:',
                    observationData
                );
                return null;
            }
        } else {
            console.error('Invalid forecast data received:', forecastData);
            return null;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // SWR will handle the error
    }
};

export default function useWeatherData() {
    const { data, error } = useSWR('weatherData', fetcher, {
        refreshInterval: 600000, // Refresh every 10 minute
    });

    return {
        weatherData: data,
        isLoading: !error && !data,
        isError: error,
    };
}
