// pages/api/processRadarImages.js

import { requestRainRadar } from '@/lib/fmiQueryData';
import { fetchRadarImagesAndSave } from '@/lib/radarImageUtils/imageHandling';
import { pruneOldRadarImages } from '@/lib/radarImageUtils/pruneImages';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { timestamps } = req.body; // Get the timestamps from the POST request body

        if (!timestamps || timestamps.length === 0) {
            return res.status(400).json({ error: 'No timestamps provided' });
        }

        try {
            // Generate radar image URLs based on the received timestamps
            const urls = timestamps.map((time) => {
                const config = requestRainRadar(time);
                return `${config.url}?${new URLSearchParams(config.params).toString()}`;
            });

            // Prune old radar images (keep only images corresponding to the new timestamps)
            await pruneOldRadarImages(timestamps);

            // Fetch and save radar images concurrently using the generated URLs
            const imagePaths = await fetchRadarImagesAndSave(urls, timestamps);

            const result = timestamps.map((timestamp, index) => ({
                timestamp,
                url: imagePaths[index],
            }));

            res.status(200).json({ imagePaths: result });
        } catch (error) {
            res.status(500).json({ error: 'Failed to process radar images' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' }); // Only allow POST requests
    }
}
