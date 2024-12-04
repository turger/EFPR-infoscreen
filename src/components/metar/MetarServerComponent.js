import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import isEqual from 'lodash.isequal';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';
import { fetcherXML } from '@/lib/fetcherXML';

function compareData(currentData, newData) {
    return isEqual(currentData, newData);
}

async function saveMetarReport(reportData) {
    try {
        const response = await fetch('/api/metarHandler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportData: String(reportData) }),
        });

        const result = await response.json();

        if (!response.ok)
            throw new Error(result.error || 'Error saving report');
    } catch (error) {
        console.error('Failed to save METAR report:', error);
    }
}

async function fetchMetarReports() {
    const response = await fetch('/api/metarHandler');
    const data = await response.json();
    return data;
}

export default function MetarServerComponent() {
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const previousDataRef = useRef(null); // Store the previous data
    const isFirstLoadRef = useRef(true); // Check if it's the first load
    const lastSavedReportRef = useRef(null);
    const [reportsFifteenMinutesAgo, setReportsFifteenMinutesAgo] = useState(
        []
    );
    const [reportsOneHourAgo, setReportsOneHourAgo] = useState([]);

    useEffect(() => {
        async function getReports() {
            try {
                const reportsData = await fetchMetarReports();

                setReportsFifteenMinutesAgo(
                    reportsData.results_15_minutes_ago || []
                );
                setReportsOneHourAgo(reportsData.results_1_hour_ago || []);
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        }

        getReports();
        const intervalId = setInterval(getReports, 60000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        async function deleteReports() {
            try {
                const response = await fetch('/api/deleteMetarReports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete reports');
                }
            } catch (error) {
                console.error('Failed to delete reports:', error);
            }
        }

        deleteReports();

        const intervalId = setInterval(deleteReports, 86400000);

        return () => clearInterval(intervalId);
    }, []);

    const weatherStation = '107029';
    //pyhtää 107029

    const now = new Date();
    const thirteenMinutesAgo = new Date(now.getTime() - 13 * 60 * 1000);
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

    const formatDateUTC = (date) =>
        date.toISOString().replace(/\.\d{3}Z$/, 'Z');

    const startTimeForWindDirection = formatDateUTC(thirteenMinutesAgo);
    const endTimeForWindDirection = formatDateUTC(threeMinutesAgo);

    const windApiUrl = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::observations::weather::simple&fmisid=${weatherStation}&starttime=${startTimeForWindDirection}&endtime=${endTimeForWindDirection}&parameters=winddirection&format=application/xml`;

    threeMinutesAgo.setSeconds(0, 0);

    const startTime = formatDateUTC(threeMinutesAgo);

    // Create the end time, which is exactly one second after the start time
    const endTimeDate = new Date(threeMinutesAgo.getTime() + 1000);
    const endTimeForThreeMinutesAgo = formatDateUTC(endTimeDate);

    const weatherApiUrl = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::observations::weather::simple&fmisid=${weatherStation}&starttime=${startTime}&endtime=${endTimeForThreeMinutesAgo}&parameters=humidity,wawa,temperature,visibility,winddirection,windspeedms,windgust,dewpoint,totalcloudcover,pressure&format=application/xml`;

    // Use a single SWR call to fetch both URLs
    const { data, error, isValidating } = useSWR(
        [windApiUrl, weatherApiUrl],
        fetcherXML,
        {
            refreshInterval: 60000,
            revalidateIfStale: false, // Disable revalidation if data is stale
            revalidateOnFocus: false, // Disable revalidation on focus
            revalidateOnReconnect: false, // Disable revalidation on reconnect
            compare: compareData, // Use the custom compare function
            shouldRetryOnError: true, // Retry on error (default is true)
            errorRetryInterval: 5000, // Wait 5 seconds before retrying
            errorRetryCount: 3, // Retry up to 3 times
        }
    );

    useEffect(() => {
        if (data) {
            // On initial load, used to prevent showing the loading spinner on first load
            if (isFirstLoadRef.current) {
                setIsLoading(false);
                isFirstLoadRef.current = false;
                previousDataRef.current = data;
                return;
            }

            // If data is being fetched and data has changed
            if (isValidating && !compareData(previousDataRef.current, data)) {
                setIsLoading(true);
                // After data is fetched and different
                const timer = setTimeout(() => {
                    setIsLoading(false);
                    previousDataRef.current = data;
                }, 500); // Adjust the delay as needed
                return () => clearTimeout(timer);
            }

            // If data is being fetched but data hasn't changed
            if (isValidating && compareData(previousDataRef.current, data)) {
                setIsLoading(false);
            }
        }
    }, [data, isValidating]);

    // Show error message if there's an error
    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    // Show loading spinner while loading
    if (isLoading || !data) {
        return <LoadingSpinner />;
    }

    const { windXmlDoc, weatherXmlDoc } = data;

    let winddirection = [];
    let windspeed = null,
        windgust = null,
        pressure = null,
        visibility = null,
        temperature = null,
        dewpoint = null,
        totalcloudcover = null,
        wawa = null,
        humidity = null,
        windDirWeather = null;

    const windMembers = windXmlDoc.getElementsByTagName('wfs:member');
    for (let i = 0; i < windMembers.length; i++) {
        const paramName = windMembers[i].getElementsByTagName(
            'BsWfs:ParameterName'
        )[0]?.textContent;
        const paramValue = parseFloat(
            windMembers[i].getElementsByTagName('BsWfs:ParameterValue')[0]
                ?.textContent
        );

        if (paramName === 'winddirection') {
            winddirection.push(paramValue);
        }
    }

    const minDir =
        winddirection.length > 0
            ? Math.round(Math.min(...winddirection) / 10) * 10
            : '000';
    const maxDir =
        winddirection.length > 0
            ? Math.round(Math.max(...winddirection) / 10) * 10
            : '000';

    const weatherMembers = weatherXmlDoc.getElementsByTagName('wfs:member');
    for (let i = 0; i < weatherMembers.length; i++) {
        const paramName = weatherMembers[i].getElementsByTagName(
            'BsWfs:ParameterName'
        )[0]?.textContent;
        const paramValue = parseFloat(
            weatherMembers[i].getElementsByTagName('BsWfs:ParameterValue')[0]
                ?.textContent
        );

        switch (paramName) {
            case 'windspeedms':
                windspeed = paramValue;
                break;
            case 'windgust':
                windgust = paramValue;
                break;
            case 'pressure':
                pressure = paramValue;
                break;
            case 'visibility':
                visibility = paramValue;
                break;
            case 'temperature':
                temperature = paramValue;
                break;
            case 'dewpoint':
                dewpoint = paramValue;
                break;
            case 'totalcloudcover':
                totalcloudcover = paramValue;
                break;
            case 'wawa':
                wawa = paramValue;
                break;
            case 'humidity':
                humidity = paramValue;
                break;
            case 'winddirection':
                windDirWeather = paramValue;
                break;
            default:
                break;
        }
    }

    const windSpeed =
        windspeed !== null && !isNaN(windspeed)
            ? String(Math.round(windspeed * 1.94384)).padStart(2, '0')
            : '////';
    const gustSpeed =
        windgust !== null && !isNaN(windgust)
            ? String(Math.round(windgust * 1.94384)).padStart(2, '0')
            : '////';

    const visibilityKm =
        visibility !== null && !isNaN(visibility)
            ? visibility > 10000
                ? '9999'
                : visibility >= 5000
                  ? String(Math.round(visibility / 1000) * 1000).padStart(
                        4,
                        '0'
                    )
                  : visibility >= 800
                    ? String(Math.round(visibility / 100) * 100).padStart(
                          4,
                          '0'
                      )
                    : String(Math.round(visibility / 50) * 50).padStart(4, '0')
            : '////';

    const pressureValue =
        pressure !== null && !isNaN(pressure)
            ? String(Math.round(pressure)).padStart(4, '0')
            : '////';

    let cloudCover = 'CLR';
    if (totalcloudcover !== null && !isNaN(totalcloudcover)) {
        let cloudBaseFeet = ((temperature - dewpoint) / 2.5) * 1000; //estimated cloud base using mathematical formula
        cloudBaseFeet = Math.max(0, Math.min(cloudBaseFeet, 9999));
        let cloudBase = String(Math.floor(cloudBaseFeet / 100)).padStart(
            3,
            '0'
        );

        if (totalcloudcover <= 2) {
            cloudCover = `FEW${cloudBase}`;
        } else if (totalcloudcover <= 4) {
            cloudCover = `SCT${cloudBase}`;
        } else if (totalcloudcover <= 7) {
            cloudCover = `BKN${cloudBase}`;
        } else {
            cloudCover = `OVC${cloudBase}`;
        }
    } else {
        cloudCover = '///';
    }

    let wawaMetar = '';
    if (wawa === 0.0) {
        wawaMetar = '';
    } else if (wawa === 4.0 || wawa === 5.0) {
        wawaMetar = 'HZ/FU/DU';
    } else if (wawa === 30.0 && visibility < 1000) {
        wawaMetar = 'FG';
    } else if (wawa === 30.0 && humidity > 80.0) {
        wawaMetar = 'HZ';
    } else if (wawa === 30.0) {
        wawaMetar = 'BR';
    } else if (wawa === 40.0) {
        wawaMetar = 'RA';
    } else if (wawa === 41.0) {
        wawaMetar = '-RA';
    } else if (wawa === 42.0) {
        wawaMetar = '+RA';
    } else if (wawa === 50.0 || wawa === 51.0) {
        wawaMetar = '-DZ';
    } else if (wawa === 52.0) {
        wawaMetar = 'DZ';
    } else if (wawa === 53.0) {
        wawaMetar = '+DZ';
    } else if (wawa === 54.0) {
        wawaMetar = '-FZDZ';
    } else if (wawa === 55.0) {
        wawaMetar = 'FZDZ';
    } else if (wawa === 56.0) {
        wawaMetar = '+FZDZ';
    } else if (wawa === 60.0 || wawa === 61.0) {
        wawaMetar = '-RA';
    } else if (wawa === 62.0) {
        wawaMetar = 'RA';
    } else if (wawa === 63.0) {
        wawaMetar = '+RA';
    } else if (wawa === 64.0) {
        wawaMetar = '-FZRA';
    } else if (wawa === 65.0) {
        wawaMetar = 'FZRA';
    } else if (wawa === 66.0) {
        wawaMetar = '+FZRA';
    } else if (wawa === 67.0) {
        wawaMetar = '-RASN';
    } else if (wawa === 68.0) {
        wawaMetar = 'RASN';
    } else if (wawa === 70.0 || wawa === 72.0) {
        wawaMetar = 'SN';
    } else if (wawa === 71.0) {
        wawaMetar = '-SN';
    } else if (wawa === 73.0) {
        wawaMetar = '+SN';
    } else if (wawa === 74.0) {
        wawaMetar = '-PE';
    } else if (wawa === 75.0) {
        wawaMetar = 'PE';
    } else if (wawa === 76.0) {
        wawaMetar = '+PE';
    } else if (wawa === 77.0) {
        wawaMetar = 'SG';
    } else if (wawa === 78.0) {
        wawaMetar = 'IC';
    } else if (wawa === 80.0) {
        wawaMetar = '-PRRA';
    } else if (wawa === 81.0) {
        wawaMetar = '-SHRA';
    } else if (wawa === 82.0) {
        wawaMetar = 'SHRA';
    } else if (wawa === 83.0 || wawa === 84.0) {
        wawaMetar = '+SHRA';
    } else if (wawa === 85.0) {
        wawaMetar = '-SHSN';
    } else if (wawa === 86.0) {
        wawaMetar = 'SHSN';
    } else if (wawa === 87.0) {
        wawaMetar = '+SHSN';
    } else if (wawa === 89.0) {
        wawaMetar = 'GR';
    } else if (isNaN(wawa)) {
        wawaMetar = '//';
    }

    let weatherCondition = '';
    if (
        visibility >= 10000 &&
        (totalcloudcover === null || totalcloudcover < 2) &&
        wawa == 0.0
    ) {
        weatherCondition = 'CAVOK';
    } else {
        weatherCondition = `${visibilityKm} ${wawaMetar} ${cloudCover}`;
    }

    const gustInfo = gustSpeed !== '' ? `G${gustSpeed}` : '';
    const temp =
        temperature !== null
            ? (temperature < 0 ? 'M' : '') +
              String(Math.abs(Math.round(temperature))).padStart(2, '0')
            : '///';

    const dew =
        dewpoint !== null
            ? (dewpoint < 0 ? 'M' : '') +
              String(Math.abs(Math.round(dewpoint))).padStart(2, '0')
            : '/';

    const windDir =
        windDirWeather !== null && !isNaN(windDirWeather)
            ? String(Math.round(windDirWeather / 10) * 10).padStart(3, '0')
            : '/';

    const utcDay = String(threeMinutesAgo.getUTCDate()).padStart(2, '0');

    const utcTime = threeMinutesAgo
        .toISOString()
        .slice(11, 16)
        .replace(':', '');

    const windDirVariation = minDir !== maxDir ? ` ${minDir}V${maxDir}` : '';

    const metarReport = `EFPR ${utcDay}${utcTime}Z AUTO ${windDir}${windSpeed}${gustInfo}KT${windDirVariation} ${weatherCondition} ${temp}/${dew} Q${pressureValue}=`;

    if (metarReport !== lastSavedReportRef.current) {
        saveMetarReport(metarReport);
        lastSavedReportRef.current = metarReport;
    }

    return (
        <div className="flex flex-col h-full w-full">
            {/* Main content area */}
            <div className="flex-grow overflow-auto">
                <p>{metarReport}</p>

                <br />

                <ul>
                    {reportsFifteenMinutesAgo.length > 0 ? (
                        reportsFifteenMinutesAgo.map((report) => (
                            <li key={report.id}>{report.report_data}</li>
                        ))
                    ) : (
                        <li>No data available yet.</li>
                    )}
                </ul>

                <br />

                <ul>
                    {reportsOneHourAgo.length > 0 ? (
                        reportsOneHourAgo.map((report) => (
                            <li key={report.id}>{report.report_data}</li>
                        ))
                    ) : (
                        <li>No data available yet.</li>
                    )}
                </ul>
                <br />
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end text-xs">
                {/* Bottom left */}
                <p className="text-gray-400">
                    Not suitable for official flight preparation
                </p>

                {/* Bottom right */}
                <p className="text-gray-400">
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
