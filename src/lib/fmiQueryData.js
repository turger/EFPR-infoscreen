const wmsUrl = 'https://openwms.fmi.fi/geoserver/Radar/wms';
const wmsImageWidth = 1987;
const wmsImageHeight = 3144;

// the EPSG:3857 bounds because of leaflet
export const projectionBounds = [
    1877673.7198253432, 7709459.582123121, 4160194.1605840144,
    11396482.455942834,
];
const projectionSrs = 'EPSG:3857';

export function requestRainRadar(time) {
    return wmsRequestConfig('Radar:suomi_rr_eureffin', time); // Radar:suomi ... is the layer id to get the current and previous data
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

    // Generate timestamps using the nthTenMinuteDivisibleTimestamp function
    numberSeries.reverse().forEach((n) => {
        const timestamp = nthTenMinuteDivisibleTimestamp(baseDate)(n);
        uniqueTimestamps.add(timestamp);
    });

    return Array.from(uniqueTimestamps);
}

function nthTenMinuteDivisibleTimestamp(baseDate) {
    return (n) => {
        //Extracting minutes from baseDate
        const minutes = new Date(baseDate).getMinutes();
        let fiveMinutesOffset = 0;
        //Checks the baseDate minutes, FMI updates data every full 5 minutes
        if (n === 0 && minutes % 10 <= 5) {
            fiveMinutesOffset = 5 * 60 * 1000
        }
        const tenMinutes = 10 * 60 * 1000;
        const lastFullTenMinutes = Math.floor(baseDate / tenMinutes) * tenMinutes;
        return new Date(lastFullTenMinutes - n * tenMinutes - fiveMinutesOffset).toISOString();
    };
}
