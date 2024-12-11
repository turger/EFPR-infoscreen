// components/notam/WeatherServerComponent.js
import {useEffect, useState} from 'react';
import styles from './cloud.module.css';
import Image from 'next/image';
import {weatherImg} from '@/pages/api/weatherIcon';
import LoadingSpinner from '../LoadingSpinner';
import {extractFirstAndSecondAverage} from '@/lib/fetchForecast';

import useWeatherData from '@/lib/weatherData';

export default function WeatherServerComponent() {
    const {weatherData, isLoading, isError} = useWeatherData();

    const [iconName, seticonName] = useState('default');
    const [firstDayAverage, setFirstDayAverage] = useState(null);
    const [secondDayAverage, setSecondDayAverage] = useState(null);
    const [firstDayName, setFirstDayName] = useState(null);
    const [secondDayName, setSecondDayName] = useState(null);
    const [isNight, setIsNight] = useState(false);

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
                {/*  <h1 className={styles.h1}>Now</h1>*/}
                <div className={styles.imgcontainer}>
                    <Image
                        src={`/svgs/weatherIcons/${iconName}.svg`}
                        alt={iconName}
                        width={100}
                        height={100}
                    />
                    <span className={styles.iconName}>{iconName}</span>
                </div>
            </div>
            {/* Display daily avarges*/}
            <div className={styles.forecastContainer}>
                <div className={styles.AvaragesContainer}>
                    <div className={styles.AvargeFirst}>
                        <div>{firstDayName}</div>
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
                            width={80}
                            height={80}
                        />
                        <div>{firstDayAverage?.avgTemperature}°C</div>
                        <div>{firstDayAverage?.avgRain} mm</div>
                    </div>

                    <div className={styles.AvargeSecond}>
                        <div>{secondDayName}</div>
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
                            width={80}
                            height={80}
                        />
                        <div>{secondDayAverage?.avgTemperature}°C</div>
                        <div>{secondDayAverage?.avgRain} mm</div>
                    </div>
                </div>
            </div>

            <div className={styles.infoAndAvarage}>
                <div className={styles.infoAndobservationLeft}>
                    <div className={styles.infocontainerLeft}>
                        <div>Temperature</div>
                        <div>Humidity</div>
                        <div>Wind direction</div>
                        <div>Precipitation</div>
                        <div>CloudCover </div>
                    </div>
                    <div className={styles.observationLeft}>
                        <div>
                            {weatherData.observation.temperatureOBSERVATION}°C
                        </div>
                        <div>
                            {weatherData.observation.humidityOBSERVATION} %
                        </div>
                        <div>
                            {weatherData.observation.windDirectionOBSERVATION}°
                        </div>
                        <div>
                            {(
                                weatherData.observation
                                    .tenMinPrecipitationOBSERVATION * 6
                            ).toFixed(0)}
                            &nbsp;mm
                        </div>
                        <div>
                            {weatherData.observation.CloudCoverageOBSERVATION}/8
                        </div>
                    </div>
                </div>

                <div className={styles.infoAndobservationRight}>
                    <div className={styles.infocontainerRight}>
                        <div>Dewpoint:</div>
                        <div>Wind</div>
                        <div>Wind gust</div>
                        <div>Visibility</div>
                        <div>Pressure</div>
                    </div>
                    <div className={styles.observationRight}>
                        <div>
                            {weatherData.observation.dewPointOBSERVATION}°C
                        </div>
                        <div>{weatherData.observation.WindOBSERVATION} m/s</div>
                        <div>
                            {weatherData.observation.WindGustOBSERVATION} m/s
                        </div>
                        <div>
                            {weatherData.observation.visibilityOBSERVATION} km
                        </div>
                        <div>
                            {weatherData.observation.p_seaOBSERVATION} hPa
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
