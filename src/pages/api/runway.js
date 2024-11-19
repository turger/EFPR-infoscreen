import fetch from 'node-fetch';

let accessToken = null;
let tokenExpirationTime = null;

async function getAccessToken(forceNewToken = false) {
    if (!forceNewToken && accessToken && tokenExpirationTime && new Date() < tokenExpirationTime) {
        console.log('Using cached access token');
        return accessToken;
    }

    const clientId = process.env.RUNWAY_ID;
    const clientSecret = process.env.RUNWAY_SECRET;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://wxh-app-app-prod-eu.auth.eu-west-1.amazoncognito.com/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
        },
        body: new URLSearchParams({
            'grant_type': 'client_credentials',
            'scope': 'wxh/api'
        })
    });

    if (!response.ok) {
        console.error(`Error fetching access token: ${response.statusText}`);
        throw new Error(`Error fetching access token: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpirationTime = new Date(new Date().getTime() + data.expires_in * 1000); // seconds to milliseconds

    console.log('Fetched new access token');
    console.log(`Token expires in: ${data.expires_in} seconds`);
    console.log(`Token expiration time: ${tokenExpirationTime}`);

    return accessToken;
}

async function fetchDataWithToken(url, token) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });

    if (!response.ok) {
        console.error(`Error fetching data: ${response.statusText}`);
        throw new Error(`Error fetching data: ${response.statusText}`);
    }

    return response.json();
}

export default async function handler(req, res) {
    const apiUrl = 'https://api.eu.wxhorizon.vaisala.com/api/v1/station_observations?latest=true';

    try {
        let accessToken = await getAccessToken();
        let data;

        try {
            data = await fetchDataWithToken(apiUrl, accessToken);
        } catch (error) {
            console.error('Initial fetch failed, fetching new token and retrying...');
            accessToken = await getAccessToken(true); // Fetch a new token
            data = await fetchDataWithToken(apiUrl, accessToken); // Retry with new token
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(`Error in handler: ${error.message}`);
        res.status(500).json({ error: `Error fetching data: ${error.message}` });
    }
}