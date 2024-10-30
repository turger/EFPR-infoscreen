import sharp from 'sharp';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { list } from '@vercel/blob';

const storageDir = path.join(process.cwd(), 'storage', 'radarImages');

const localUrl = '/api/getRadarImage?filename=';
// Adjust this to match your uploadBlob.js path
const uploadBlobUrl = 'https://eha-infoscreen.vercel.app/api/uploadBlob';

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
        const blobExistsUrl = await doesBlobExist(blobFileName);
        if (blobExistsUrl) {
            console.log('image already exists at: ' + blobExistsUrl);
            return blobExistsUrl;
        }
    }

    try {
        // Fetch the image
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(
                `Failed to fetch image from ${url}: ${res.statusText} Status: ${res.status}`
            );
        }

        // Buffer the image data
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        //Saving locally
        if (process.env.NODE_ENV === 'development') {
            //Process the image with Sharp
            const processedBuffer = await processImage(buffer);
            await fsPromises.writeFile(savePath, processedBuffer);
            return `${localUrl}${fileName}`;
        }
        const blobResult = await uploadImageToBlob(buffer, blobFileName);
        console.log('Image saved to: ' + blobResult.url);

        return blobResult.url;
    } catch (error) {
        throw new Error(error);
    }
};

// Function to upload the processed image to the blob
const uploadImageToBlob = async (imageBuffer, filename) => {
    try {
        // Convert the image buffer to a Blob
        const blob = new Blob([imageBuffer], { type: 'image/png' });

        const response = await fetch(`${uploadBlobUrl}?filename=${filename}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'image/png',
            },
            body: blob,
        });

        if (!response.ok) {
            throw new Error(
                `Failed to upload image to blob: ${response.statusText}`
            );
        }

        return await response.json(); // Return the blob information, which includes the URL
    } catch (error) {
        throw new Error(`Error uploading image: ${error.message}`);
    }
};

// Helper function to check if blob already exists
async function doesBlobExist(fileName) {
    try {
        const response = await list();
        const blobs = response.blobs || [];

        // Find the blob with the specific filename
        const foundBlob = blobs.find((blob) => blob.pathname === `${fileName}`);
        if (foundBlob) {
            return foundBlob.url; // Return the full URL
        }

        return null; // Return null if the blob does not exist
    } catch (error) {
        console.error('Error checking blob existence:', error);
        return null; // Return null in case of an error
    }
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
