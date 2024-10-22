import fetch from 'node-fetch';

export default async function getAdsbData(req, res) {
    try {
        const adsb_apikey = process.env.ADSB_APIKEY;
        const adsb_userkey = process.env.ADSB_USERKEY;

        if (!adsb_apikey || !adsb_userkey) {
            return res.status(500).json({ error: 'Missing API or USER KEY' });
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
        res.status(200).json(data);
    } catch (error) {
        console.log('Error fetching ADS-B data:', error);
        res.status(500).json({ error: 'Failed to fetch ADS-B data' });
    }
}
