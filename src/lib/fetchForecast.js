import convert from 'xml-js';
import {DOMParser} from 'xmldom';

export default async function fetchAndCalculateAverages() {
    const currentTime = new Date(); // Get current time
    const startTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
    startTime.setHours(0, 0, 0, 0); //set starttime to 00:00
    const endTime = new Date(startTime.getTime() + 48 * 60 * 60 * 1000);
    endTime.setHours(0, 0, 0, 0); // set endtime to 00:00

    //fetch data from fmi
    const url = `https://opendata.fmi.fi/wfs?request=getFeature&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair&place=Pyhtää&starttime=${startTime.toISOString()}&endtime=${endTime.toISOString()}`;
    try {
        //fetch the data fron api
        const response = await fetch(url);
        const xml = await response.text();

        //parse xml using domarser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');

        //extract timeseries data
        const members = Array.from(xmlDoc.getElementsByTagName('wfs:member'));

        //object to store daily data
        const dailyData = {};

        // *************TEST DATA************
        /*const dailyData = { 
        "2024-12-01": {
            Temperature: [20, 22, NaN, 25, 18, null, 19, NaN, 21, 23, 22, 24, null, NaN, 20, 19, 21, 23, 22, NaN, 20, 19, null, 21],
            CloudCover: [2, 3, NaN, 4, null, 5, 6, 3, NaN, null, 2, 3, 4, 5, 6, NaN, 2, 3, 4, 5, NaN, null, 3, 4],
            Rain: [0, 0.5, 1, NaN, null, 0, 0.2, NaN, 0.4, 0.6, NaN, null, 0, 0.1, 0.3, 0.5, 0, 0.2, NaN, 0, 0, 0.4, null, 0.1],
        },
        
    };*/

        // loop through member and extract data
        for (const member of members) {
            // get the observed data temperature CloudCover, or precipitation
            const observedProperty = member
                .getElementsByTagName('om:observedProperty')[0]
                .getAttribute('xlink:href');

            //get the time series data (measurement points)
            const result = member.getElementsByTagName(
                'wml2:MeasurementTimeseries'
            )[0];
            const points = result.getElementsByTagName('wml2:point');

            // determine the parameter based on the observed property
            const parameter = observedProperty.includes('Temperature')
                ? 'Temperature'
                : observedProperty.includes('CloudCover')
                  ? 'CloudCover'
                  : observedProperty.includes('Precipitation')
                    ? 'Rain'
                    : null;

            // if the parameter is not recognized skip this member
            if (!parameter) continue;

            //loop through each point in time series and extract data
            Array.from(points).forEach((point) => {
                const time =
                    point.getElementsByTagName('wml2:time')[0].textContent;
                const value = parseFloat(
                    point.getElementsByTagName('wml2:value')[0].textContent
                );

                //extract the date from the time and format it
                const date = new Date(time).toISOString().split('T')[0];

                // initialize daily data entry if it doesn't exist
                if (!dailyData[date]) {
                    dailyData[date] = {
                        Temperature: [],
                        CloudCover: [],
                        Rain: [],
                    };
                }

                //add the value to the corresponding parameter temperature, CloudCover, rain
                dailyData[date][parameter].push(value);
            });
        }

        //calculate averages for each parameter temperature, CloudCover, rain by date
        const averages = Object.entries(dailyData).map(([date, data]) => {
            const validTemps = data.Temperature.filter(
                (t) => t !== null && !isNaN(t)
            );
            const avgTemp =
                validTemps.length > 0
                    ? (
                          validTemps.reduce((sum, t) => sum + t, 0) /
                          validTemps.length
                      ) // Use the actual count of valid entries
                          .toFixed(0)
                    : null;

            const validCloud = data.CloudCover.filter(
                (c) => c !== null && !isNaN(c)
            );
            const avgCloud =
                validCloud.length > 0
                    ? validCloud.reduce((sum, c) => sum + c, 0) /
                      validCloud.length
                    : null;

            const avgCloudOkta =
                avgCloud !== null ? convertToOkta(avgCloud) : null;

            const validRain = data.Rain.filter((r) => r !== null && !isNaN(r));
            const avgRain =
                validRain.length > 0
                    ? (
                          validRain.reduce((sum, r) => sum + r, 0) /
                          validRain.length
                      ).toFixed(0)
                    : null;

            return {
                date,
                avgTemperature: avgTemp,
                avgCloudCover: avgCloudOkta,
                avgRain: avgRain,
            };
        });

        //return the calculated averages
        return averages;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}
// convert cloudcovarage to oktas
function convertToOkta(cloudCoverage) {
    if (cloudCoverage === 0) {
        return 0;
    } else if (cloudCoverage > 0 && cloudCoverage < 18.75) {
        return 1;
    } else if (cloudCoverage >= 18.75 && cloudCoverage < 31.25) {
        return 2;
    } else if (cloudCoverage >= 31.25 && cloudCoverage < 43.75) {
        return 3;
    } else if (cloudCoverage >= 43.75 && cloudCoverage < 56.25) {
        return 4;
    } else if (cloudCoverage >= 56.25 && cloudCoverage < 68.75) {
        return 5;
    } else if (cloudCoverage >= 68.75 && cloudCoverage < 81.25) {
        return 6;
    } else if (cloudCoverage >= 81.25 && cloudCoverage < 100) {
        return 7;
    } else if (cloudCoverage === 100) {
        return 8;
    } else {
        return 9; //sky obscured
    }
}

//fetch the data
async function startDailyUpdate() {
    const averages = await fetchAndCalculateAverages();
    return averages;
}

// daily update
function scheduleDailyUpdate() {
    startDailyUpdate();

    // start every 24h
    setInterval(startDailyUpdate, 24 * 60 * 60 * 1000);
    //setInterval(startDailyUpdate, 10 * 1000);
}

// scheduleDailyUpdate();

export function transformDailyAverages(dailyAverages) {
    if (!dailyAverages || dailyAverages.length === 0) {
        return [];
    }

    return dailyAverages.map((day) => ({
        date: day.date,
        avgTemperature: day.avgTemperature ?? 'N/A',
        avgCloudCover: day.avgCloudCover ?? 'N/A',
        avgRain: day.avgRain ?? 'N/A',
    }));
}

export function extractFirstAndSecondAverage(dailyAverages) {
    // transform the daily averages data
    const transformedAverages = transformDailyAverages(dailyAverages);

    // if there are not enough days, return null for both days
    if (transformedAverages.length < 2) {
        console.log('Not enough data for both first and second day.');
        return {
            firstDay: null,
            secondDay: null,
        };
    }

    // return days
    return {
        firstDay: transformedAverages[1],
        secondDay: transformedAverages[2],
    };
}
