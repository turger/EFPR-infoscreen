export const fetcherXML = async (urls) => {
    try {
        const responses = await Promise.all(
            urls.map(async (url) => {
                const response = await fetch(url);
                if (!response.ok) {
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
                return await response.text();
            })
        );

        const parser = new DOMParser();
        return {
            windXmlDoc: parser.parseFromString(responses[0], 'text/xml'),
            weatherXmlDoc: parser.parseFromString(responses[1], 'text/xml'),
        };
    } catch (error) {
        throw new Error(error.message);
    }
};
