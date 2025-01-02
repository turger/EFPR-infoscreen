// lib/sendTimestampsToApi.js
export const sendTimestampsToBlobAPI = async (newTimestamps) => {
    try {
        const response = await fetch('/api/uploadBlob', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({timestamps: newTimestamps}),
        });

        if (!response.ok) {
            throw new Error('Failed to send timestamps to blob API');
        }

        const data = await response.json();
        return data.imagePaths;
    } catch (error) {
        throw new Error(
            'Error sending timestamps to blob API: ' + error.message
        );
    }
};
