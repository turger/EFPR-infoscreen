import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import { list, del } from '@vercel/blob';

const storageDir = path.join(process.cwd(), 'storage', 'radarImages');

export async function pruneOldRadarImages(newTimestamps) {
    const retries = 3;
    if (process.env.NODE_ENV === 'development') {
        await fsPromises.mkdir(storageDir, { recursive: true });
    }

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
                const response = await list();

                const blobs = response.blobs || [];
                if (blobs.length === 0) {
                    return; // No need to continue if there are no blobs
                }

                // Extracts existing blob names and URLs
                const existingBlobs = blobs.map((blob) => ({
                    name: blob.pathname,
                    url: blob.url,
                }));

                const savedTimestamps = blobs
                    .map((blob) => {
                        const match = blob.pathname.match(
                            /radar-image-(.*)\.png/
                        );
                        return match ? match[1] : null;
                    })
                    .filter(Boolean); // Filter out any nulls in case of bad matches

                const timestampsToDelete = savedTimestamps.filter(
                    (savedTimestamp) =>
                        !formattedNewTimestamps.includes(savedTimestamp)
                );

                if (timestampsToDelete.length === 0) {
                    return; // No need to continue if there are no blobs to delete
                }

                await Promise.all(
                    timestampsToDelete.map(async (timestamp) => {
                        const blobName = `radar-image-${timestamp}.png`;
                        const blobToDelete = existingBlobs.find(
                            (blob) => blob.name === `${blobName}`
                        );
                        if (blobToDelete) {
                            //Console logs go to the Vercel dashboard logs, so it's fine to use them in blob logic
                            console.log('blob to delete: ' + blobToDelete.url);
                            await del(blobToDelete.url);
                        }
                    })
                );

                return; // Exit if successful
            } catch (error) {
                if (i === retries - 1) {
                    throw new Error(
                        `Error pruning Vercel Blob radar images: ${error.message}`
                    );
                }
            }
        }
    }
}
