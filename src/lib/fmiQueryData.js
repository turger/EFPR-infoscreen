const wmsUrl = 'https://openwms.fmi.fi/geoserver/Radar/wms';
const wmsImageWidth = 1987;
const wmsImageHeight = 3144;
//The EPSG:4326 projection bounds would be: 16.8674,56.7513,37.3717,70.9831
/*const projectionBounds = [
    -118331.366408, 6335621.167014, 875567.731907, 7907751.537264,
];
//EPSG:4326 is the most used EPSG projection
const projectionSrs = 'EPSG:3067'; //This is the code for the Finnish projected coordinates that FMI uses
*/
const projectionBounds = [16.8674, 56.7513, 37.3717, 70.9831];
const projectionSrs = 'EPSG:4326';
export function requestRainRadar(time) {
    return wmsRequestConfig('Radar:suomi_rr_eureffin', time); // Radar:suomi ... is the layer id to get the current and previous data
}

export function requestRainRadarEstimate(time) {
    return wmsRequestConfig('Radar:suomi_tuliset_rr_eureffin', time); // This was in the sataako.fi files, but I don't see how they are used. Keeping it here just in case for now
}

//setting the query params for the request
export const defaultQueryParams = {
    service: 'WMS', //Web Map Service
    version: '2.0.0',
    request: 'GetMap',
    format: 'image/PNG',
    transparent: 'true',
    bbox: projectionBounds.join(','),
    srs: projectionSrs,
    width: wmsImageWidth,
    height: wmsImageHeight,
};

// this creates the final configuration for the requests done in another js component
function wmsRequestConfig(layer, time) {
    return {
        url: wmsUrl,
        responseType: 'arraybuffer',
        timeout: 30000, //30 seconds
        params: {
            ...defaultQueryParams,
            layers: layer,
            time: time,
        },
    };
}

export function generateRadarFrameTimestamps(
    framesCount,
    baseDate = Date.now()
) {
    const uniqueTimestamps = new Set();
    const numberSeries = Array.from({ length: framesCount }, (_, n) => n);

    // Ensure baseDate is rounded down to the nearest ten minutes
    const tenMinutes = 10 * 60 * 1000;
    const lastFullTenMinutes = Math.floor(baseDate / tenMinutes) * tenMinutes;

    // Generate timestamps using the nthTenMinuteDivisibleTimestamp function
    numberSeries.reverse().forEach((n) => {
        const timestamp = nthTenMinuteDivisibleTimestamp(lastFullTenMinutes)(
            n + 1
        );
        uniqueTimestamps.add(timestamp);
    });

    return Array.from(uniqueTimestamps);
}

function nthTenMinuteDivisibleTimestamp(baseDate) {
    return (n) => {
        const tenMinutes = 10 * 60 * 1000;
        return new Date(baseDate - n * tenMinutes).toISOString();
    };
}
