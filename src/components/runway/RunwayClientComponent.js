"use client";

import { useState } from 'react';
import styles from './runwayTemp.module.css';

export default function RunwayClientComponent({ data }) {
    const [windData, setWindData] = useState({ knots: "N/A", angle: 0 }); // TBD: get real data
    const [visibleTooltip, setVisibleTooltip] = useState(null);

    const getTemperatureBySiteId = (siteId) => {
        const station = data.find(station => station.siteId === siteId);
        return station ? `${station.temp}°C` : 'N/A';
    };

    const getStationBySiteId = (siteId) => {
        return data.find(station => station.siteId === siteId);
    };

    const getColorAndExplanationByCondition = (condition) => {
        switch (condition) {
            case 1:
                return { color: 'Green', explanation: 'Dry' };
            case 13:
                return { color: 'blue', explanation: 'Not dry' };
            default:
                return { color: 'black', explanation: 'N/A' };
        }
    };

    return (
        <div className={styles.fidgetContainer}>
            <div className={styles.fidget}>
                <div className={styles.temperatureContainer}>
                    {['52280', '52437', '52281'].map(siteId => {
                        const station = getStationBySiteId(siteId);
                        const temperature = getTemperatureBySiteId(siteId);
                        const condition = station?.condition;
                        const colorAndExplanation = getColorAndExplanationByCondition(condition);

                        if (!station || temperature === undefined || !colorAndExplanation) {
                            return null;
                        }

                        return (
                            <div key={siteId} className={styles.temperatureValue}>
                                <span style={{ fontWeight: 'bold' }}>{station.name}</span>
                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>{temperature}</span>
                                <span style={{ color: colorAndExplanation.color, fontWeight: 'bold' }}>
                                    {colorAndExplanation.explanation}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <img src='/svgs/runway.svg' alt="Airstrip" className={styles.airstripImage} />
                <div className={styles.windIndicator}>
                    <img
                        src='/svgs/wind.svg'
                        className={styles.windArrow}
                        style={{ transform: `translate(-50%, -50%) rotate(${windData.angle + 180}deg)` }}
                        alt="Wind indicator"
                    />
                    <div className={styles.windSpeed}>
                        <span>{windData.knots} knots</span>
                        <br />
                        <span>{windData.angle}°</span>
                    </div>
                </div>
                <div
                    className={styles.ball}
                    data-siteid="52280"
                    onMouseEnter={() => setVisibleTooltip('52280')}
                    onMouseLeave={() => setVisibleTooltip(null)}
                    style={{ backgroundColor: getColorAndExplanationByCondition(getStationBySiteId('52280')?.condition).color }}
                >
                    {visibleTooltip === '52280' && (
                        <div className={styles.tooltip}>
                            {getStationBySiteId('52280')?.name}<br />
                            {getColorAndExplanationByCondition(getStationBySiteId('52280')?.condition).explanation}<br />
                            {getTemperatureBySiteId('52280')}
                        </div>
                    )}
                </div>
                <div
                    className={styles.ball}
                    data-siteid="52437"
                    onMouseEnter={() => setVisibleTooltip('52437')}
                    onMouseLeave={() => setVisibleTooltip(null)}
                    style={{ backgroundColor: getColorAndExplanationByCondition(getStationBySiteId('52437')?.condition).color }}
                >
                    {visibleTooltip === '52437' && (
                        <div className={styles.tooltip}>
                            {getStationBySiteId('52437')?.name}<br />
                            {getColorAndExplanationByCondition(getStationBySiteId('52437')?.condition).explanation}<br />
                            {getTemperatureBySiteId('52437')}
                        </div>
                    )}
                </div>
                <div
                    className={styles.ball}
                    data-siteid="52281"
                    onMouseEnter={() => setVisibleTooltip('52281')}
                    onMouseLeave={() => setVisibleTooltip(null)}
                    style={{ backgroundColor: getColorAndExplanationByCondition(getStationBySiteId('52281')?.condition).color }}
                >
                    {visibleTooltip === '52281' && (
                        <div className={styles.tooltip}>
                            {getStationBySiteId('52281')?.name}<br />
                            {getColorAndExplanationByCondition(getStationBySiteId('52281')?.condition).explanation}<br />
                            {getTemperatureBySiteId('52281')}
                        </div>
                    )}
                </div>
                <div className={styles.footer}>
                    <p style={{ fontSize: 10, textAlign: "center", color: "black", paddingTop: 3 }}>Data provided by: XAMK</p>
                </div>
            </div>
        </div>
    );
}