import React, {useEffect, useRef, useState} from 'react';
import isEqual from 'lodash.isequal';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';
import {getThreeLatestMetarDatas} from './utils';
import styles from './metar.module.css';

function compareData(currentData, newData) {
    return isEqual(currentData, newData);
}

export default function MetarServerComponent() {
    const [error, setError] = useState();
    const [data, setData] = useState();

    const weatherStation = '107029'; //Pyhtää 107029

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const startTime = oneHourAgo.toISOString();

    const parameters =
        'humidity,wawa,temperature,visibility,winddirection,wd_10min,windspeedms,ws_10min,windgust,wg_10min,dewpoint,totalcloudcover,pressure';

    const weatherApiUrl = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::observations::weather::simple&fmisid=${weatherStation}&starttime=${startTime}&parameters=${parameters}&format=application/xml`;

    useEffect(() => {
        const getData = async () => {
            try {
                fetch(weatherApiUrl)
                    .then((response) => response.text())
                    .then((text) => setData(text));
            } catch (error) {
                setError(error.message);
            }
        };

        getData();
        const interval = setInterval(getData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    if (!data) {
        return <LoadingSpinner />;
    }

    const threeLatestMetarDatas = getThreeLatestMetarDatas(data);

    return (
        <div className={styles.metarContainer}>
            {/* Main content area */}
            <div className={styles.metarItems}>
                {threeLatestMetarDatas.map((metarReport) => (
                    <p key={metarReport}>{metarReport}</p>
                ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col justify-between items-start">
                {/* Bottom left */}
                <p className={styles.metarFooter}>
                    Not suitable for official flight preparation
                </p>

                {/* Bottom right */}
                <p className={styles.metarFooter}>
                    Weather data from:{' '}
                    <a
                        href="https://en.ilmatieteenlaitos.fi/open-data"
                        className="text-blue-400"
                    >
                        en.ilmatieteenlaitos.fi/open-data
                    </a>
                </p>
            </div>
        </div>
    );
}
