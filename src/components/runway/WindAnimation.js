import React from 'react';
import styles from './WindAnimation.module.css';

export default function WindAnimation({ windDirection, windGust }) {
    const maxWindGust = 20; // Maximum expected wind gust
    const maxDuration = 4; // Slowest animation duration in seconds
    const minDuration = 1; // Fastest animation duration in seconds

    // Ensure windGust is a number and within expected range
    const normalizedWindGust = Math.min(Math.max(windGust, 0), maxWindGust);

    // Calculate animation duration
    const windSpeed =
        maxDuration -
        (normalizedWindGust / maxWindGust) * (maxDuration - minDuration);

    return (
        <div className={styles.windContainer}>
            <div
                className={styles.wind}
                style={{
                    '--windSpeed': `${windSpeed}s`,
                    transform: `rotate(${Number(windDirection)}deg)`,
                }}
            >
                <span className={styles.windLine}></span>
                <span className={styles.windLine}></span>
                <span className={styles.windLine}></span>
            </div>
        </div>
    );
}
