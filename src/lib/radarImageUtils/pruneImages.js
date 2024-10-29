import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import { listBlobs, deleteBlob } from '@vercel/blob';

const storageDir = path.join(process.cwd(), 'storage', 'radarImages');

export async function pruneOldRadarImages(newTimestamps) {
    const retries = 3;
    await fsPromises.mkdir(storageDir, { recursive: true });

    // Format new timestamps to match the saved filenames
    const formattedNewTimestamps = newTimestamps.map((timestamp) =>
        timestamp.replace(/:/g, '-')
    );

    if (process.env.NODE_ENV === 'development') {
        for (let i = 0; i < retries; i++) {
            try {
                // Read all files from the storage directory
                const files = await fs.promises.readdir(storageDir);

                if (files.length === 0) {
                    console.log('No images found. Skipping pruning.');
                    return; // Skip the pruning process
                }

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
    } else {
        // Pruning from Vercel Blob in production
        for (let i = 0; i < retries; i++) {
            try {
                // List all blobs in the Vercel Blob storage
                const blobs = await listBlobs();

                // Extract blob names and timestamps
                const savedTimestamps = blobs
                    .map((blob) => {
                        // Assuming your blob naming convention matches
                        const match = blob.name.match(/radar-image-(.*)\.png/);
                        return match ? match[1] : null;
                    })
                    .filter(Boolean); // Filter out any nulls in case of bad matches

                // Find timestamps to delete
                const timestampsToDelete = savedTimestamps.filter(
                    (savedTimestamp) =>
                        !formattedNewTimestamps.includes(savedTimestamp)
                );

                // Delete outdated blobs
                await Promise.all(
                    timestampsToDelete.map(async (timestamp) => {
                        await deleteBlob(`radar-image-${timestamp}.png`);
                    })
                );

                return; // Exit if successful
            } catch (error) {
                if (i === retries - 1)
                    throw new Error(
                        'Error pruning Vercel Blob radar images: ',
                        error
                    );
            }
        }
    }
}
