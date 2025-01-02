// components/notam/WeatherServerComponent.js
import {useEffect, useState} from 'react';
import styles from './cloud.module.css';
import Image from 'next/image';
import {weatherImg} from '@/pages/api/weatherIcon';
import LoadingSpinner from '../LoadingSpinner';
import {extractFirstAndSecondAverage} from '@/lib/fetchForecast';

import useWeatherData from '@/lib/weatherData';

const weatherDataList = (weatherData) => [
    {
        title: 'Temperature',
        data: `${weatherData.observation.temperatureOBSERVATION} °C`,
    },
    {
        title: 'Humidity',
        data: `${weatherData.observation.humidityOBSERVATION} %`,
    },
    {
        title: 'Wind direction',
        data: `${weatherData.observation.windDirectionOBSERVATION}°`,
    },
    {
        title: 'Precipitation',
        data: `${(weatherData.observation.tenMinPrecipitationOBSERVATION * 6).toFixed(0)} mm`,
    },
    {
        title: 'CloudCover',
        data: `${weatherData.observation.CloudCoverageOBSERVATION}/8`,
    },
    {
        title: 'Dewpoint',
        data: `${weatherData.observation.dewPointOBSERVATION}°C`,
    },
    {title: 'Wind', data: `${weatherData.observation.WindOBSERVATION} m/s`},
    {
        title: 'Wind gust',
        data: `${weatherData.observation.WindGustOBSERVATION} m/s`,
    },
    {
        title: 'Visibility',
        data: `${weatherData.observation.visibilityOBSERVATION} km`,
    },
    {
        title: 'Pressure',
        data: `${weatherData.observation.p_seaOBSERVATION} hPa`,
    },
];

export default function WeatherServerComponent() {
    const {weatherData, isLoading, isError} = useWeatherData();

    const [iconName, seticonName] = useState('default');
    const [firstDayAverage, setFirstDayAverage] = useState(null);
    const [secondDayAverage, setSecondDayAverage] = useState(null);
    const [firstDayName, setFirstDayName] = useState(null);
    const [secondDayName, setSecondDayName] = useState(null);
    const [isNight, setIsNight] = useState(false);
    const [showFirstHalf, setShowFirstHalf] = useState(true);
    const [dataToShow, setDataToShow] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowFirstHalf((prev) => !prev);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (weatherData) {
            const allData = weatherDataList(weatherData);
            const midPoint = Math.ceil(allData.length / 2);
            const dataToShow = showFirstHalf
                ? allData.slice(0, midPoint)
                : allData.slice(midPoint);

            setDataToShow(dataToShow);
        }
    }, [weatherData, showFirstHalf]);

    useEffect(() => {
        if (weatherData) {
            // Update the icon name based on the observation data
            const icon = weatherImg(weatherData.observation, isNight);
            seticonName(icon);

            // Extract averages from the forecast data
            const {firstDay, secondDay} = extractFirstAndSecondAverage(
                weatherData.forecast
            );
            setFirstDayAverage(firstDay);
            setSecondDayAverage(secondDay);
        }
    }, [weatherData, isNight]);

    useEffect(() => {
        function getDayName(dateString) {
            if (!dateString) return 'Invalid Date';
            const dateObject = new Date(dateString);
            const options = {weekday: 'long'};
            return new Intl.DateTimeFormat('en-US', options).format(dateObject);
        }

        if (firstDayAverage?.date) {
            setFirstDayName(getDayName(firstDayAverage.date));
        }

        if (secondDayAverage?.date) {
            setSecondDayName(getDayName(secondDayAverage.date));
        }
    }, [firstDayAverage, secondDayAverage]);

    useEffect(() => {
        const today = new Date();
        const sunrise = new Date(today);
        sunrise.setHours(7, 0, 0, 0);
        const sunset = new Date(today);
        sunset.setHours(18, 0, 0, 0);

        const isNightTime = today < sunrise || today > sunset;
        setIsNight(isNightTime); // Update the isNight state
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError || !weatherData) {
        return <div>Error loading data</div>;
    }

    return (
        <div className={styles.box}>
            {/* <div>{weatherData.observation.suomiAika}</div> */}
            <div className={styles.weatherInfo}>
                <div className={styles.LocationAndTemp}>
                    <div className={styles.location}></div>
                    <div className={styles.location}>
                        <span className={styles.text}>Now</span>
                    </div>
                    <div className={styles.temp}>
                        {weatherData.observation.temperatureOBSERVATION}°C
                    </div>
                </div>
                <div className={styles.imgcontainer}>
                    <Image
                        src={`/svgs/weatherIcons/${iconName}.svg`}
                        alt={iconName}
                        width={100}
                        height={100}
                        className={styles.nowImage}
                    />
                </div>
            </div>
            {/* Display daily avarges*/}
            <div className={styles.forecastContainer}>
                <div className={styles.AvaragesContainer}>
                    <div className={styles.average}>
                        <div>{firstDayName}</div>
                        <div className={styles.averageRow}>
                            <Image
                                src={`/svgs/weatherIcons/${weatherImg({
                                    CloudCoverageOBSERVATION:
                                        firstDayAverage?.avgCloudCover,
                                    tenMinPrecipitationOBSERVATION:
                                        firstDayAverage?.avgRain / 6, // Convert rain to 10 minutes
                                    temperatureOBSERVATION:
                                        firstDayAverage?.avgTemperature,
                                })}.svg`}
                                alt="First Day Weather Icon"
                                width={50}
                                height={50}
                                className={styles.image}
                            />
                            <div className={styles.averageWeatherDetails}>
                                <div>{firstDayAverage?.avgTemperature}°C</div>
                                <div>{firstDayAverage?.avgRain} mm</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.average}>
                        <div>{secondDayName}</div>
                        <div>
                            <div className={styles.averageRow}>
                                <Image
                                    src={`/svgs/weatherIcons/${weatherImg({
                                        CloudCoverageOBSERVATION:
                                            secondDayAverage?.avgCloudCover,
                                        tenMinPrecipitationOBSERVATION:
                                            secondDayAverage?.avgRain / 6, // Convert rain to 10 minutes
                                        temperatureOBSERVATION:
                                            secondDayAverage?.avgTemperature,
                                    })}.svg`}
                                    alt="Second Day Weather Icon"
                                    width={50}
                                    height={50}
                                    className={styles.image}
                                />
                                <div className={styles.averageWeatherDetails}>
                                    <div>
                                        {secondDayAverage?.avgTemperature}°C
                                    </div>
                                    <div>{secondDayAverage?.avgRain} mm</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.weatherData}>
                {dataToShow.map((item, index) => (
                    <div className={styles.weatherDataItem} key={index}>
                        <div>{item.title}</div>
                        <div>{item.data}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
