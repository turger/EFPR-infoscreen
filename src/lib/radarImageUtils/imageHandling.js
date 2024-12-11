import {fetchAndSaveImage} from './saveLocal';

// Function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Main function to fetch and save all radar images
export async function fetchRadarImagesAndSave(
    urls,
    timestamps,
    concurrencyLimit = 2
) {
    const imagePaths = []; // Array to hold successfully saved image paths
    const executing = []; // Array to track currently executing promises

    for (let i = 0; i < urls.length; i++) {
        const promise = fetchAndSaveImage(urls[i], timestamps[i])
            .then((imagePath) => {
                if (imagePath) {
                    imagePaths.push(imagePath); // Add the path if successfully saved
                }
            })
            .catch((error) => {
                throw new Error(
                    `Error processing image ${urls[i]}: ${error.message}`
                );
            })
            .finally(() => {
                // Remove the promise from the executing array once done
                executing.splice(executing.indexOf(promise), 1);
            });

        executing.push(promise);

        // If we've reached the concurrency limit, wait for one of the promises to resolve
        if (executing.length >= concurrencyLimit) {
            await Promise.race(executing); // Wait for any promise to resolve
        }

        // Introduce a delay between fetches
        await delay(700); // Adjust delay as needed
    }

    // Wait for all remaining promises to complete
    await Promise.all(executing);

    return imagePaths; // Return array of saved image paths
}
