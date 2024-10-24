// pages/api/processRadarImages.js

import { requestRainRadar } from '@/lib/fmiQueryData';
import { fetchRadarImagesAndSave, pruneOldRadarImages } from '@/lib/imageUtils'; // Import the necessary functions

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
            await fetchRadarImagesAndSave(urls, timestamps);

            // Return the paths to the saved images (using the formatted timestamps)
            const localImagePaths = timestamps.map((time) => {
                const formattedTime = time.replace(/:/g, '-'); // Format the timestamp for the file name
                return {
                    url: `/api/getRadarImage?filename=radar-image-${formattedTime}.png`,
                    timestamp: time, // Keep the original time for use on the client
                };
            });

            res.status(200).json({ imagePaths: localImagePaths });
        } catch (error) {
            console.error('Could not do something', error);
            res.status(500).json({ error: 'Failed to process radar images' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' }); // Only allow POST requests
    }
}
