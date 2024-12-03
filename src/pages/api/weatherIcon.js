import { useState, useEffect } from 'react';
// TEMp, Cloudcover, oneHourperc
export default function WeatherIcon({ data }) {
    const [weatherData, setWeatherData] = useState(null);

    useEffect(() => {
        if (data) {
            setWeatherData(data); // Aseta data vain, jos sitä on olemassa
        }
    }, [data]); // Suorita vain, kun `data` muuttuu
}

///FOR TESTING PURPOSES :
const mockweatherData = {
    CloudCoverageOBSERVATION: 7, // You can change this value to test different cases (0-8)
    oneHourPrecipitationOBSERVATION: 2, // You can change this value to test different rain levels
    temperatureOBSERVATION: -1,
    tenMinPrecipitationOBSERVATION: 3,
};
export const weatherImg = (weatherData) => {
    let iconName = 'default';

    let {
        CloudCoverageOBSERVATION,
        tenMinPrecipitationOBSERVATION,
        temperatureOBSERVATION,
    } = weatherData;
    try {
        const hourlyPrecipitationOBSERVATION =
            tenMinPrecipitationOBSERVATION * 6; //tenMin is some time more accurate and doesnot give NaN so often

        if (
            isNaN(
                CloudCoverageOBSERVATION ||
                    isNaN(hourlyPrecipitationOBSERVATION)
            )
        ) {
            console.warn(
                'CloudCoverageOBSERVATION or oneHourPrecipitationOBSERVATION is NaN, using fallback icon.'
            );
            return 'default'; // Return "storm" or any fallback icon
        }

        if (CloudCoverageOBSERVATION === 0) {
            iconName = 'clear';
        }

        if (CloudCoverageOBSERVATION === 1 || CloudCoverageOBSERVATION === 2) {
            // Default to 'fair' weather
            iconName = 'fair';

            if (hourlyPrecipitationOBSERVATION === 0) {
                // No precipitation
                iconName = 'fair'; // No additional suffix for no precipitation
            } else if (hourlyPrecipitationOBSERVATION <= 2.5) {
                if (temperatureOBSERVATION >= 0) {
                    // Light rain (above freezing)
                    iconName = 'partlycloudy-light';
                } else if (temperatureOBSERVATION < 0) {
                    // Light snow (below freezing)
                    iconName = 'partlycloudy-light-snow';
                }
            } else if (hourlyPrecipitationOBSERVATION <= 7.5) {
                if (temperatureOBSERVATION >= 0) {
                    // Moderate rain (above freezing)
                    iconName = 'partlycloudy-moderate';
                } else if (temperatureOBSERVATION < 0) {
                    // Moderate snow (below freezing)
                    iconName = 'partlycloudy-moderate-snow';
                }
            } else {
                if (temperatureOBSERVATION >= 0) {
                    // Heavy rain (above freezing)
                    iconName = 'partlycloudy-heavy';
                } else if (temperatureOBSERVATION < 0) {
                    // Heavy snow (below freezing)
                    iconName = 'partlycloudy-heavy-snow';
                }
            }
        }
        if (
            CloudCoverageOBSERVATION === 3 ||
            CloudCoverageOBSERVATION === 4 ||
            CloudCoverageOBSERVATION === 5
        ) {
            // Default to 'partlycloudy' weather
            iconName = 'partlycloudy';

            if (hourlyPrecipitationOBSERVATION === 0) {
                // No precipitation
                iconName = 'partlycloudy'; // No additional suffix for no precipitation
            } else if (hourlyPrecipitationOBSERVATION <= 2.5) {
                if (temperatureOBSERVATION >= 0) {
                    // Light rain (above freezing)
                    iconName += '-light';
                } else if (temperatureOBSERVATION < 0) {
                    // Light snow (below freezing)
                    iconName += '-light-snow';
                }
            } else if (hourlyPrecipitationOBSERVATION <= 7.5) {
                if (temperatureOBSERVATION >= 0) {
                    // Moderate rain (above freezing)
                    iconName += '-moderate';
                } else if (temperatureOBSERVATION < 0) {
                    // Moderate snow (below freezing)
                    iconName += '-moderate-snow';
                }
            } else {
                if (temperatureOBSERVATION >= 0) {
                    // Heavy rain (above freezing)
                    iconName += '-heavy';
                } else if (temperatureOBSERVATION < 0) {
                    // Heavy snow (below freezing)
                    iconName += '-heavy-snow';
                }
            }
        }
        if (CloudCoverageOBSERVATION === 6 || CloudCoverageOBSERVATION === 7) {
            iconName = 'mostlycloudy'; // Default icon for mostly cloudy

            if (hourlyPrecipitationOBSERVATION === 0) {
                // No precipitation
                iconName = 'mostlycloudy'; // No additional suffix for no precipitation
            } else if (hourlyPrecipitationOBSERVATION <= 2.5) {
                if (temperatureOBSERVATION >= 0) {
                    // Light rain (above freezing)
                    iconName += '-light';
                } else if (temperatureOBSERVATION < 0) {
                    // Light snow (below freezing)
                    iconName += '-light-snow';
                }
            } else if (hourlyPrecipitationOBSERVATION <= 7.5) {
                if (temperatureOBSERVATION >= 0) {
                    // Moderate rain (above freezing)
                    iconName += '-moderate';
                } else if (temperatureOBSERVATION < 0) {
                    // Moderate snow (below freezing)
                    iconName += '-moderate-snow';
                }
            } else {
                if (temperatureOBSERVATION >= 0) {
                    // Heavy rain (above freezing)
                    iconName += '-heavy';
                } else if (temperatureOBSERVATION < 0) {
                    // Heavy snow (below freezing)
                    iconName += '-heavy-snow';
                }
            }
        }

        if (CloudCoverageOBSERVATION === 8) {
            iconName = 'overcast'; // Default icon for overcast

            if (hourlyPrecipitationOBSERVATION === 0) {
                // No precipitation
                iconName = 'overcast'; // No additional suffix for no precipitation
            } else if (hourlyPrecipitationOBSERVATION <= 2.5) {
                if (temperatureOBSERVATION >= 0) {
                    // Light rain (above freezing)
                    iconName += '-light';
                } else if (temperatureOBSERVATION < 0) {
                    // Light snow (below freezing)
                    iconName += '-light-snow';
                }
            } else if (hourlyPrecipitationOBSERVATION <= 7.5) {
                if (temperatureOBSERVATION >= 0) {
                    // Moderate rain (above freezing)
                    iconName += '-moderate';
                } else if (temperatureOBSERVATION < 0) {
                    // Moderate snow (below freezing)
                    iconName += '-moderate-snow';
                }
            } else {
                if (temperatureOBSERVATION >= 0) {
                    // Heavy rain (above freezing)
                    iconName += '-heavy';
                } else if (temperatureOBSERVATION < 0) {
                    // Heavy snow (below freezing)
                    iconName += '-heavy-snow';
                }
            }
        }
        return iconName;
    } catch (error) {
        console.error('Error in determining weather icon:', error);
        return 'default';
    }
};
