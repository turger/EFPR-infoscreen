// components/notam/WeatherServerComponent.js

import { useEffect, useState, React } from 'react';
import styles from './cloud.module.css';
import useWeatherData from '@/lib/weatherData';
import Image from 'next/image';
import { weatherImg } from '@/pages/api/weatherIcon';
import WeatherIcon from '@/pages/api/weatherIcon';

export default function WeatherServerComponent() {
    const { weatherData, isLoading, isError } = useWeatherData();
    const [iconName, setIconName] = useState('default');

    useEffect(() => {
        if (weatherData) {
            setIconName(weatherImg(weatherData));
        }
    }, [weatherData]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError || !weatherData) {
        return <div>Error loading data</div>;
    }

    return (
        <div className={styles.box}>
            <WeatherIcon data={weatherData} />
            {/* <div>{weatherData.observation.suomiAika}</div> */}
            <div className={styles.imgcontainer}>
                <Image
                    //src="/svgs/weatherIcons/default.svg"
                    src={`/svgs/weatherIcons/${iconName}.svg`}
                    alt={iconName}
                    width={80}
                    height={80}
                />
            </div>
            <div className={styles.infocontainer}>
                <div className={styles.left}>
                    <div>Temp:</div>
                    <div>Humidity:</div>
                    <div>Wind direction:</div>
                    <div>Precipitation:</div>
                    <div>Cloud cover:</div>
                    <div>Dewpoint:</div>
                    <div>Wind:</div>
                    <div>Wind gust:</div>
                    <div>Visibility:</div>
                    <div>Pressure:</div>
                </div>

                <div className={styles.right}>
                    <div className={styles.fade}>
                        {weatherData.observation.temperatureOBSERVATION} °C
                    </div>
                    <div className={styles.fade}>
                        {weatherData.observation.humidityOBSERVATION} %
                    </div>
                    <div className={styles.fade}>
                        {weatherData.observation.windDirectionOBSERVATION}°
                    </div>
                    <div className={styles.fade}>
                        {
                            weatherData.observation
                                .oneHourPrecipitationOBSERVATION
                        }{' '}
                        MM
                    </div>
                    <div className={styles.fade}>
                        {weatherData.observation.CloudCoverageOBSERVATION}/8
                    </div>
                    <div className={styles.fade}>
                        {weatherData.observation.dewPointOBSERVATION} °C
                    </div>
                    <div className={styles.fade}>
                        {weatherData.observation.WindOBSERVATION} M/S
                    </div>
                    <div className={styles.fade}>
                        {weatherData.observation.WindGustOBSERVATION} M/S
                    </div>
                    <div className={styles.fade}>
                        {weatherData.observation.visibilityOBSERVATION} KM
                    </div>
                    <div className={styles.fade}>
                        {weatherData.observation.p_seaOBSERVATION} HPR
                    </div>
                </div>
            </div>
        </div>
        //KUVAT TOIMIVAT public kansiossa
    );
}
