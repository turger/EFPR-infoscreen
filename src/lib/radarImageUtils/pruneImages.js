import path from 'path';
import fs, { promises as fsPromises } from 'fs';
const storageDir = path.join(process.cwd(), 'storage', 'radarImages');

export async function pruneOldRadarImages(newTimestamps) {
    const retries = 3;
    await fsPromises.mkdir(storageDir, { recursive: true });
    for (let i = 0; i < retries; i++) {
        try {
            // Read all files from the storage directory
            const files = await fs.promises.readdir(storageDir);

            if (files.length === 0) {
                console.log('No images found. Skipping pruning.');
                return; // Skip the pruning process
            }

            // Format new timestamps to match the saved filenames
            const formattedNewTimestamps = newTimestamps.map((timestamp) =>
                timestamp.replace(/:/g, '-')
            );

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
                (savedTimestamp) =>
                    !formattedNewTimestamps.includes(savedTimestamp)
            );

            // Delete outdated images
            await Promise.all(
                timestampsToDelete.map(async (timestamp) => {
                    const filePath = path.join(
                        storageDir,
                        `radar-image-${timestamp}.png`
                    );
                    await fs.promises.unlink(filePath);
                })
            );
        } catch (error) {
            if (i === retries - 1)
                throw new Error('Error pruning radar images: ', error);
        }
    }
}
