import fetch from "node-fetch";

export default async function getAirspaces(req, res) {
    try {
        const url1 = `https://flyk.com/api/airspaces.geojson`;
        const response1 = await fetch(url1, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response1.ok) {
            throw new Error(
                `Error fetching Airspaces data: Status: ${response1.status}, Message: ${response1.statusText}`
            );
        }

        const data1 = await response1.json();

        const filteredFeatures1 = data1.features.filter(feature => {
            const airspaceClass = feature.properties.airspaceclass;
            const isActive = feature.properties.active;
            return ["Danger", "Prohibited", "Restricted", "Other"].includes(airspaceClass) && isActive;
        });

        const url2 = `https://flyk.com/api/reservations.geojson`;
        const response2 = await fetch(url2, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response2.ok) {
            throw new Error(
                `Error fetching Reservations data: Status: ${response2.status}, Message: ${response2.statusText}`
            );
        }

        const data2 = await response2.json();

        const filteredFeatures2 = data2.features.filter(feature => {
            const airspaceClass = feature.properties.airspaceclass;
            const isActive = feature.properties.active;
            return ["TSA"].includes(airspaceClass) && isActive;
        });

        const combinedFeatures = [...filteredFeatures1, ...filteredFeatures2];

        const combinedData = {
            type: "FeatureCollection",
            features: combinedFeatures,
        };

        res.status(200).json(combinedData);
    } catch (error) {
        console.log("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}