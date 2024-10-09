// lib/fetcher.js

// This is a utility function that fetches data from a URL and returns the response as JSON.
export async function fetcher(url) {
    try {
        const response = await fetch(url);

        // Check if the response is not successful
        if (!response.ok) {
            // Define a set of generic error messages based on HTTP status codes
            const genericErrorMessages = {
                400: 'Bad Request. Please check your input.',
                401: 'Unauthorized. Please check your credentials.',
                403: 'Forbidden. You do not have permission to access this resource.',
                404: 'Not Found. The requested resource could not be found.',
                500: 'Internal Server Error. Please try again later.',
                502: 'Bad Gateway. The server received an invalid response.',
                503: 'Service Unavailable. Please try again later.',
                504: 'Gateway Timeout. The server took too long to respond.',
            };

            // Use the generic error message if available, or fallback to a default message
            const message =
                genericErrorMessages[response.status] ||
                'An error occurred. Please try again later.';

            // Create and throw a new error with the message
            throw new Error(message);
        }

        // Return the response data if successful
        return await response.json();
    } catch (error) {
        // For any error, directly throw the error with its message
        throw new Error(error.message);
    }
}
