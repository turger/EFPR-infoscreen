// pages/api/processRadarImages.js

import {
    generateRadarFrameTimestamps,
    requestRainRadar,
} from '@/lib/fmiQueryData';
import { fetchRadarImagesAndSave, pruneOldRadarImages } from '@/lib/imageUtils'; // This is the function we defined

export default async function handler(req, res) {
    try {
        // Generate timestamps for radar frames
        const timestamps = generateRadarFrameTimestamps(12);

        // Generate radar image URLs
        const urls = timestamps.map((time) => {
            const config = requestRainRadar(time);
            return `${config.url}?${new URLSearchParams(config.params).toString()}`;
        });

        await pruneOldRadarImages(timestamps);

        // Fetch and save radar images concurrently
        await fetchRadarImagesAndSave(urls, timestamps);

        // Return local image paths to the client
        const localImagePaths = timestamps.map((time) => {
            const formattedTime = time.replace(/:/g, '-');
            return {
                url: `/api/getRadarImage?filename=radar-image-${formattedTime}.png`,
                timestamp: time, // Keep the original time for use on the client
            };
        });

        res.status(200).json({ imagePaths: localImagePaths });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process radar images' });
    }
}
