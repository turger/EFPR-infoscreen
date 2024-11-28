// components/notam/WeatherServerComponent.js

import { useEffect, useState, React } from 'react';
import styles from './cloud.module.css';

import observation from '@/pages/api/observation';
import Image from 'next/image';
import { weatherImg } from '@/pages/api/weatherIcon';
import fetchAndCalculateAvarage from '@/pages/api/fetchForecast.js';
import {
    transformDailyAverages,
    extractFirstAndSecondAverage,
} from '@/pages/api/fetchForecast';
import LoadingSpinner from '../LoadingSpinner';

import WeatherIcon from '@/pages/api/weatherIcon';

export default function WeatherServerComponent() {
    // Use the fetched weather data from CloudCover
    const [weatherData, setWeatherData] = useState(null);
    //const iconName = weatherImg(weatherData); // icon names
    const [iconName, seticonName] = useState('default');

    const [dailyAverages, setDailyAvarages] = useState(null);

    const [firstDayAverage, setFirstDayAverage] = useState(null);
    const [secondDayAverage, setSecondDayAverage] = useState(null);

    const [firstDayName, setFirstDayName] = useState(null);
    const [secondDayName, setSecondDayName] = useState(null);

    const fetchData = async () => {
        try {
            const observationdata = await observation(); // Await the Promise

            const avaragesData = await fetchAndCalculateAvarage();

            console.log('Fetched Averages Data:', avaragesData);
            // console.log('Fetched forecast data:', forecastdata);
            // console.log('Fetched observation data:', observationdata);

            // Tarkistetaan, että forecastdata on olio

            if (observationdata && typeof observationdata === 'object') {
                // Yhdistetään observationdata ja forecastdata yhteen objektiin ja päivitetään tila
                setWeatherData({
                    observation: observationdata,
                });

                const { firstDay, secondDay } =
                    extractFirstAndSecondAverage(avaragesData);
                setFirstDayAverage(firstDay);
                setSecondDayAverage(secondDay);

                seticonName(weatherImg(weatherData)); // Pass observation data

                console.log('First Day Average:', firstDay);
                console.log('Second Day Average:', secondDay);

                console.log('First Average:', firstDayAverage);

                console.log(
                    'server comp test for avarages',
                    weatherData.observation
                );
            } else {
                console.error(
                    'Invalid observation data received:',
                    observationdata
                );
            }
        } catch (error) {
            console.error('Error fetching data:', error); // Handle any errors
        }
    };

    useEffect(() => {
        fetchData(); // Fetch data initially once

        // Set interval to refetch observation data every 10 minutes (600000 ms)
        const intervalId = setInterval(() => {
            fetchData();
        }, 60000); // 1 minutes in milliseconds

        // Clear the interval when component unmounts
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures the effect runs only once at mount

    useEffect(() => {
        if (weatherData) {
            // Pass only observation data (or whichever part of the data is needed for the icon)
            const icon = weatherImg(weatherData.observation); // Using only the observation data here
            seticonName(icon); // Update the icon state
            //console.log('Icon Name:', icon);
        }
    }, [weatherData]);

    useEffect(() => {
        function getDayName(dateString) {
            if (!dateString) return 'Invalid Date';
            const dateObject = new Date(dateString);
            const options = { weekday: 'long' };
            return new Intl.DateTimeFormat('en-US', options).format(dateObject);
        }

        if (firstDayAverage?.date) {
            setFirstDayName(getDayName(firstDayAverage.date));
        }

        if (secondDayAverage?.date) {
            setSecondDayName(getDayName(secondDayAverage.date));
        }
    }, [firstDayAverage, secondDayAverage]);

    // Display loading state while data is being fetched
    if (!weatherData) {
        return LoadingSpinner(); //basic loading screen
    }

    return (
        <div className={styles.box}>
            <WeatherIcon data={weatherData} />
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
                        <div>Wind diection</div>
                        <div>Precipitation</div>
                        <div>CloudCover </div>
                    </div>
                    <div className={styles.observationLeft}>
                        <div>
                            {weatherData.observation.temperatureOBSERVATION}°C
                        </div>
                        <div>
                            {weatherData.observation.humidityOBSERVATION}%
                        </div>
                        <div>
                            {weatherData.observation.windDirectionOBSERVATION}°
                        </div>
                        <div>
                            {(
                                weatherData.observation
                                    .tenMinPrecipitationOBSERVATION * 6
                            ).toFixed(0)}
                            mm
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
                        <div>{weatherData.observation.WindOBSERVATION}m/s</div>
                        <div>
                            {weatherData.observation.WindGustOBSERVATION}m/s
                        </div>
                        <div>
                            {weatherData.observation.visibilityOBSERVATION} KM
                        </div>
                        <div>{weatherData.observation.p_seaOBSERVATION}hPa</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
