import fetch from 'node-fetch';

let accessToken = null;
let tokenExpirationTime = null;

async function getAccessToken() {
    if (accessToken && tokenExpirationTime && new Date() < tokenExpirationTime) {
        return accessToken;
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
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
        throw new Error(`Error fetching access token: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpirationTime = new Date(new Date().getTime() + data.expires_in * 3000); // seconds, current value = 50 minutes

    return accessToken;
}

export default async function handler(req, res) {
    try {
        const accessToken = await getAccessToken();

        const response = await fetch('https://api.eu.wxhorizon.vaisala.com/api/v1/station_observations?latest=true', {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}