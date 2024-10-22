import fetch from 'node-fetch';

// Cache to store the ADS-B data and the time of the last fetch
let adsbCache = {
    data: null,
    lastFetch: 0,
};
const CACHE_DURATION = 4000; // Cache duration 4 seconds

export default async function getAdsbData(req, res) {
    try {
        const adsb_apikey = process.env.ADSB_APIKEY;
        const adsb_userkey = process.env.ADSB_USERKEY;

        if (!adsb_apikey || !adsb_userkey) {
            return res.status(500).json({ error: 'Missing API or USER KEY' });
        }

        const now = Date.now();
        if (adsbCache.data && now - adsbCache.lastFetch < CACHE_DURATION) {
            // Return cached data if still valid
            return res.status(200).json(adsbCache.data);
        }

        const url = `https://aero-network.com/distributor/json?api-key=${adsb_apikey}&user-key=${adsb_userkey}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(
                `Error fetching ADS-B data: Status: ${response.status}, Message: ${response.statusText}`
            );
        }

        const data = await response.json();

        adsbCache = {
            data,
            lastFetch: now,
        };

        res.status(200).json(data);
    } catch (error) {
        console.log('Error fetching ADS-B data:', error);
        res.status(500).json({ error: 'Failed to fetch ADS-B data' });
    }
}
