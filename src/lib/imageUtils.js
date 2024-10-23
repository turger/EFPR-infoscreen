import path from 'path';
import sharp from 'sharp';
import fs, { createWriteStream, promises as fsPromises } from 'fs';

// Function to fetch radar images and save them as they are fetched
async function fetchRadarImagesAndSave(urls, timestamps) {
    const storageDir = path.join(process.cwd(), 'storage', 'radarImages');
    await fsPromises.mkdir(storageDir, { recursive: true });

    const imagePaths = await Promise.all(
        urls.map(async (url, index) => {
            try {
                const res = await fetch(url);
                const contentType = res.headers.get('content-type');

                // Check if the response is okay and the content type is PNG
                if (!res.ok || !contentType.startsWith('image/png')) {
                    throw new Error(
                        `Failed to fetch or invalid content type from ${url}`
                    );
                }

                const arrayBuffer = await res.arrayBuffer(); // Use arrayBuffer instead of buffer
                const pngBuffer = Buffer.from(arrayBuffer); // Convert arrayBuffer to Buffer

                // Format the timestamp for the filename
                const formattedTimestamp = timestamps[index].replace(/:/g, '-');
                const savePath = path.join(
                    storageDir,
                    `radar-image-${formattedTimestamp}.png`
                );

                // Check if the file already exists
                const fileExists = await fsPromises
                    .access(savePath)
                    .then(() => true)
                    .catch(() => false);

                if (fileExists) {
                    console.log(
                        `Image already exists at ${savePath}, skipping save.`
                    );
                    return savePath; // Return the existing file path
                }

                // Save the PNG buffer to a file
                await sharp(pngBuffer).toFile(savePath);
                console.log(`Image saved at ${savePath}`);
                return savePath;
            } catch (error) {
                console.error(
                    `Error processing image for ${timestamps[index]}:`,
                    error
                );
                return null; // Handle this appropriately in your flow
            }
        })
    );

    return imagePaths.filter(Boolean); // Filter out any null values
}

export default fetchRadarImagesAndSave;
