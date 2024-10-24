import path from 'path';
import sharp from 'sharp';
import fs, { promises as fsPromises } from 'fs';

sharp.cache(false);
sharp.concurrency(1);
const storageDir = path.join(process.cwd(), 'storage', 'radarImages');

// Main function to fetch and save all radar images
export async function fetchRadarImagesAndSave(urls, timestamps) {
    await fsPromises.mkdir(storageDir, { recursive: true });

    // Limit concurrency (optional)
    const imagePaths = await Promise.all(
        urls.map((url, index) => fetchAndSaveImage(url, timestamps[index]))
    );

    return imagePaths.filter(Boolean); // Filter out any null values
}

const fetchAndSaveImage = async (url, timestamp) => {
    const formattedTimestamp = timestamp.replace(/:/g, '-');
    const savePath = path.join(
        storageDir,
        `radar-image-${formattedTimestamp}.png`
    );

    // Check if the image already exists
    const fileExists = await fsPromises
        .access(savePath)
        .then(() => true)
        .catch(() => false);
    if (fileExists) {
        console.log(`Image already exists at ${savePath}, skipping fetch.`);
        return savePath;
    }

    try {
        // Fetch the image
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(
                `Failed to fetch image from ${url}: ${res.statusText}`
            );
        }

        // Buffer the image data
        const arrayBuffer = await res.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);

        // Process and save the image
        await sharp(buffer).trim().toFile(savePath);
        console.log(`Image saved at ${savePath}`);
        return savePath;
    } catch (error) {
        console.error(
            `Error fetching or saving image for ${timestamp}:`,
            error
        );
        return null;
    }
};

export async function pruneOldRadarImages(newTimestamps) {
    try {
        // Read all files from the storage directory
        const files = await fs.promises.readdir(storageDir);

        // Extract timestamps from filenames
        const savedTimestamps = files
            .filter((file) => file.endsWith('.png'))
            .map((file) => {
                // Extract timestamp from filename like "radar-image-2024-10-23T05-20-00.000Z.png"
                const match = file.match(/radar-image-(.*)\.png/);
                return match ? match[1] : null;
            })
            .filter(Boolean); // Filter out any nulls in case of bad matches

        // Find timestamps to delete
        const timestampsToDelete = savedTimestamps.filter(
            (savedTimestamp) => !newTimestamps.includes(savedTimestamp)
        );

        // Delete outdated images
        await Promise.all(
            timestampsToDelete.map(async (timestamp) => {
                const filePath = path.join(
                    storageDir,
                    `radar-image-${timestamp}.png`
                );
                await fs.promises.unlink(filePath);
                console.log(`Deleted outdated radar image: ${filePath}`);
            })
        );
    } catch (error) {
        console.error('Error pruning radar images:', error);
    }
}
