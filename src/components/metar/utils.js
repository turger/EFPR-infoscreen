import convert from 'xml-js';

const getVisibilityString = (visibility) => {
    // Handle invalid values
    if (visibility === null || isNaN(visibility)) return '////';

    // Less than 50m visibility
    if (visibility < 50) return '0000';

    // 10km or more
    if (visibility >= 10000) return '9999';

    // Between 50m and 10km
    if (visibility >= 5000) {
        // Round to nearest km for >= 5km
        return String(Math.round(visibility / 1000) * 1000).padStart(4, '0');
    } else if (visibility >= 1000) {
        // Round to nearest 100m for 1-5km
        return String(Math.round(visibility / 100) * 100).padStart(4, '0');
    } else {
        // Round to nearest 50m for < 1km
        return String(Math.round(visibility / 50) * 50).padStart(4, '0');
    }
};

const getWeatherCondition = (visibility, totalcloudcover, wawa, humidity) => {
    // Handle invalid wawa value
    if (wawa === null || isNaN(wawa)) {
        return '//';
    }

    // Map wawa codes to METAR weather codes
    const wawaToMetar = {
        0.0: '',
        4.0: 'HZ/FU/DU',
        5.0: 'HZ/FU/DU',
        30.0: (visibility, humidity) => {
            if (visibility < 1000) return 'FG';
            if (humidity > 80.0) return 'HZ';
            return 'BR';
        },
        40.0: 'RA',
        41.0: '-RA',
        42.0: '+RA',
        50.0: '-DZ',
        51.0: '-DZ',
        52.0: 'DZ',
        53.0: '+DZ',
        54.0: '-FZDZ',
        55.0: 'FZDZ',
        56.0: '+FZDZ',
        60.0: '-RA',
        61.0: '-RA',
        62.0: 'RA',
        63.0: '+RA',
        64.0: '-FZRA',
        65.0: 'FZRA',
        66.0: '+FZRA',
        67.0: '-RASN',
        68.0: 'RASN',
        70.0: 'SN',
        71.0: '-SN',
        72.0: 'SN',
        73.0: '+SN',
        74.0: '-PE',
        75.0: 'PE',
        76.0: '+PE',
        77.0: 'SG',
        78.0: 'IC',
        80.0: '-PRRA',
        81.0: '-SHRA',
        82.0: 'SHRA',
        83.0: '+SHRA',
        84.0: '+SHRA',
        85.0: '-SHSN',
        86.0: 'SHSN',
        87.0: '+SHSN',
        89.0: 'GR',
    };

    // Get weather code
    let wawaMetar = '';
    if (Object.prototype.hasOwnProperty.call(wawaToMetar, wawa)) {
        if (typeof wawaToMetar[wawa] === 'function') {
            wawaMetar = wawaToMetar[wawa](visibility, humidity);
        } else {
            wawaMetar = wawaToMetar[wawa];
        }
    }

    // Check for CAVOK conditions
    if (
        visibility >= 10000 &&
        (totalcloudcover === null || totalcloudcover < 2) &&
        wawa === 0.0
    ) {
        return 'CAVOK';
    }

    return wawaMetar;
};

const getCloudCover = (totalcloudcover, temperature, dewpoint) => {
    // Handle invalid inputs
    if (
        totalcloudcover === null ||
        isNaN(totalcloudcover) ||
        temperature === null ||
        isNaN(temperature) ||
        dewpoint === null ||
        isNaN(dewpoint)
    ) {
        return '///';
    }

    // Estimated cloud base using mathematical formula
    let cloudBaseFeet = ((temperature - dewpoint) / 2.5) * 1000;
    cloudBaseFeet = Math.max(0, Math.min(cloudBaseFeet, 9999));
    let cloudBase = String(Math.floor(cloudBaseFeet / 100)).padStart(3, '0');

    // Clear skies
    if (totalcloudcover === 0) {
        return 'CLR';
    }
    // Few clouds (1-2 oktas)
    else if (totalcloudcover <= 2) {
        return `FEW${cloudBase}`;
    }
    // Scattered clouds (3-4 oktas)
    else if (totalcloudcover <= 4) {
        return `SCT${cloudBase}`;
    }
    // Broken clouds (5-7 oktas)
    else if (totalcloudcover <= 7) {
        return `BKN${cloudBase}`;
    }
    // Overcast (8 oktas)
    else {
        return `OVC${cloudBase}`;
    }
};

export const getThreeLatestMetarDatas = (xml) => {
    const threeLatest = getLatestWeatherDatas(xml).slice(0, 3);

    const metarReports = threeLatest.map(
        ({
            time,
            visibility,
            pressure,
            totalcloudcover,
            temperature,
            dewpoint,
            wawa,
            humidity,
            ws_10min,
            wg_10min,
            wd_10min,
        }) => {
            // 1. Type: METAR (routine) or SPECI (special conditions)
            const metarType = 'METAR';
            // 2. Station: 4-letter ICAO code
            const metarStation = 'EFPR';
            // 3. Time: DDHHMMZ format (DD=date, HHMM=UTC time, Z=Zulu/UTC)
            // METAR time is always given in coordinated universal time (UTC)
            const dateTime = new Date(time);
            const utcDay = String(dateTime.getUTCDate()).padStart(2, '0');
            const utcTime = dateTime
                .toISOString()
                .slice(11, 16)
                .replace(':', '');
            const metarTime = `${utcDay}${utcTime}Z`;
            // 4. Modifier: AUTO=automated, COR=corrected
            const metarModifier = 'AUTO';
            // 5. Wind: DDDSS(G)KT format (DDD=direction, SS=speed, G=gust if present)
            // The wind direction is shown on a scale from 000-350 degrees, rounded to tens of degrees. Where 000 is the north, 090 is the east, 180 is the south and 270 is the west.
            const metarWindDir =
                wd_10min !== null && !isNaN(wd_10min)
                    ? String(Math.round(wd_10min / 10) * 10).padStart(3, '0')
                    : '///';
            const metarWindSpeed =
                ws_10min !== null && !isNaN(ws_10min)
                    ? String(Math.round(ws_10min)).padStart(2, '0')
                    : '//';
            const metarGust =
                wg_10min && ws_10min && wg_10min - ws_10min >= 10
                    ? `G${Math.round(wg_10min)}`
                    : '';
            const metarWind = `${metarWindDir}${metarWindSpeed}${metarGust}KT`;
            // 6. Visibility: Reported in a four figure group (e.g. 0400 = 400 metres; 8000 = 8 km) up to but excluding 10 km; 9999 = 10km or more; 0000 = less than 50 metres visibility.
            const metarVisibility = getVisibilityString(visibility);
            // 7. Weather: Intensity (-/+), vicinity (VC), descriptors (TS/RA/BR etc)
            const metarWeather = getWeatherCondition(
                visibility,
                totalcloudcover,
                wawa,
                humidity
            );
            // 8. Clouds: Coverage (BKN/OVC) + height in hundreds ft + type (CB/TCU)
            const metarClouds = getCloudCover(
                totalcloudcover,
                temperature,
                dewpoint
            );
            // 9. Temp/Dewpoint: +/-CC/+/-CC format (M prefix for negative)
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
            const metarTempDewpoint = `${temp}/${dew}`;
            // 10. Pressure: ADDDD format (29.92 = A2992)
            const pressureValue =
                pressure !== null && !isNaN(pressure)
                    ? String(Math.round(pressure)).padStart(4, '0')
                    : '////';
            const metarPressure = `Q${pressureValue}`;
            // 11. Remarks: RMK followed by wind, visibility, timing, pressure, equipment info
            // Leaving this empty for now

            return `${metarType} ${metarStation} ${metarTime} ${metarModifier} ${metarWind} ${metarVisibility} ${metarWeather} ${metarClouds} ${metarTempDewpoint} ${metarPressure}=`;
        }
    );

    return metarReports;
};

const getLatestWeatherDatas = (xml) => {
    const weatherByTime = formatWeatherByTime(xml);
    const times = Object.keys(weatherByTime);

    // Filter for measurements at 5 minute intervals (00, 05, 10, etc)
    const fiveMinuteIntervals = times.filter((time) => {
        const minutes = new Date(time).getMinutes();
        return minutes % 5 === 0;
    });

    // Get weather datas that are within 5 minutes of each other
    const result = fiveMinuteIntervals.map((time) => weatherByTime[time]);

    // Newest first
    return result.reverse();
};

const formatWeatherByTime = (xml) => {
    const json = convert.xml2json(xml, {compact: false, spaces: 4});
    const members = JSON.parse(json).elements[0].elements;

    const weatherItems = members.map((item) => {
        const name = item.elements[0].elements.find(
            (item) => item.name === 'BsWfs:ParameterName'
        )?.elements[0].text;
        const value = item.elements[0].elements.find(
            (item) => item.name === 'BsWfs:ParameterValue'
        )?.elements[0].text;
        const time = item.elements[0].elements.find(
            (item) => item.name === 'BsWfs:Time'
        )?.elements[0].text;
        return {name, value, time};
    });

    const weatherByTime = weatherItems.reduce((acc, {name, value, time}) => {
        if (!acc[time]) {
            acc[time] = {
                time: time,
            };
        }
        acc[time][name] = value;
        return acc;
    }, {});

    return weatherByTime;
};
