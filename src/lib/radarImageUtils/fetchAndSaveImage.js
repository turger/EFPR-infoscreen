import sharp from 'sharp';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { createBlob, listBlobs } from '@vercel/blob';

const storageDir = path.join(process.cwd(), 'storage', 'radarImages');

//placeholder url for vercel app, CHANGE TO CORRECT ONE BEFORE PRODUCTION
const vercelUrl = 'https://your-vercel-project.vercel.app';
const localUrl = '/api/getRadarImage?filename=';

export const fetchAndSaveImage = async (url, timestamp) => {
    // Format timestamp to exclude unallowed characters
    const formattedTimestamp = timestamp.replace(/:/g, '-');
    const fileName = `radar-image-${formattedTimestamp}.png`;
    const savePath = path.join(storageDir, fileName);
    const blobFileName = `radar-image-${formattedTimestamp}.png`;

    if (process.env.NODE_ENV === 'development') {
        // Check if the image already exists
        const fileExists = await fsPromises
            .access(savePath)
            .then(() => true)
            .catch(() => false);
        if (fileExists) {
            return `${localUrl}${fileName}`;
        }
    } else {
        const blobExists = await doesBlobExist(blobFileName);
        if (blobExists) {
            return `${vercelUrl}/path-to-blob/${blobFileName}`;
        }
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

        //Process the image with Sharp
        const processedBuffer = await processImage(buffer);

        //Saving locally
        if (process.env.NODE_ENV === 'development') {
            await fsPromises.writeFile(savePath, processedBuffer);
            return `${localUrl}${fileName}`;
        }
        const blobResult = await createBlob(processedBuffer, {
            access: 'public',
            contentType: 'image/png',
        });
        return blobResult.url;
    } catch (error) {
        throw new Error(
            `Error fetching or saving image for ${timestamp}`,
            error
        );
    }
};

// Helper function to check if blob already exists
async function doesBlobExist(fileName) {
    const blobs = await listBlobs();
    return blobs.some((blob) => blob.name === fileName);
}

//Image processing logic
const processImage = async (buffer) => {
    const { data, info } = await sharp(buffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    const outputData = Buffer.alloc(data.length);

    for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Change background color to transparent
        if (r === 204 && g === 204 && b === 204 && a < 255) {
            outputData[i] = r;
            outputData[i + 1] = g;
            outputData[i + 2] = b;
            outputData[i + 3] = 0;
        } else {
            outputData[i] = r;
            outputData[i + 1] = g;
            outputData[i + 2] = b;
            outputData[i + 3] = a;
        }
    }

    return sharp(outputData, { raw: { width, height, channels } })
        .png()
        .toBuffer();
};

/*
export const fetchAndSaveImage = async (url, timestamp) => {
    // Format timestamp to exclude unallowed characters
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

        // Process the image to change the background to transparent
        await sharp(buffer)
            .ensureAlpha() // Ensure the image has an alpha channel
            .raw() // Process raw pixel data
            .toBuffer({ resolveWithObject: true })
            .then(({ data, info }) => {
                const { width, height, channels } = info;

                // Create a new buffer for the output image
                const outputData = Buffer.alloc(data.length);

                // Change background color to transparent
                for (let i = 0; i < data.length; i += channels) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    // Check if the pixel matches the target background color
                    if (r === 204 && g === 204 && b === 204 && a < 255) {
                        // Set the pixel to fully transparent
                        outputData[i] = r;
                        outputData[i + 1] = g;
                        outputData[i + 2] = b;
                        outputData[i + 3] = 0; // Set alpha to 0
                    } else {
                        // Keep the original pixel
                        outputData[i] = r;
                        outputData[i + 1] = g;
                        outputData[i + 2] = b;
                        outputData[i + 3] = a; // Keep original alpha
                    }
                }

                // Save the modified image
                return sharp(outputData, { raw: { width, height, channels } })
                    .png() // Save as PNG to preserve transparency
                    .toFile(savePath);
            });
        return savePath;
    } catch (error) {
        throw new Error(
            `Error fetching or saving image for ${timestamp}`,
            error
        );
    }
};
*/
