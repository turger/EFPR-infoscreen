// index.js is the main file for the InfoScreen page.
import Head from 'next/head';
import Image from 'next/image';

// Import only one component which handles the rest of the components which are related to the component.
//import CameraServerComponent from '../components/example/ExampleServerComponent';
import MetarServerComponent from '@/components/metar/MetarServerComponent';
import RadarServerComponent from '@/components/rainRadar/RadarServerComponent';
import AdsbServerComponent from '@/components/adsb/AdsbServerComponent';
import RunwayServerComponent from '@/components/runway/RunwayServerComponent';
import NotamClientComponent from '@/components/notam/NotamClientComponent';
import WeatherServerComponent from '@/components/weather/WeatherServerComponent';

import InfoClientComponent from '@/components/Info/InfoClientComponent';
import DroneServerComponent from '@/components/drone/DroneServerComponent';
import {DataProvider} from '@/lib/DataContext';

import styles from './index.module.css';

export default function Home() {
    return (
        <DataProvider>
            <div className={styles.mainContainer}>
                <Head>
                    <title>Helsinki-East Aerodrome Info</title>
                    <meta
                        name="description"
                        content="Information Board For Helsinki-East Aerodrome"
                    />
                </Head>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1>Helsinki-East Aerodrome Info</h1>
                    </div>
                    <div className={styles.component + ' ' + styles.runway}>
                        <RunwayServerComponent />
                    </div>
                    <div className={styles.component + ' ' + styles.adsb}>
                        <AdsbServerComponent />
                    </div>
                    <div className={styles.component + ' ' + styles.radar}>
                        <RadarServerComponent />
                    </div>
                    <div className={styles.weather}>
                        <WeatherServerComponent />
                    </div>
                    <div className={styles.component + ' ' + styles.metar}>
                        {<MetarServerComponent />}
                    </div>
                    <div className={styles.component + ' ' + styles.notam}>
                        <NotamClientComponent />
                    </div>
                    <div className={styles.component + ' ' + styles.drones}>
                        <DroneServerComponent />
                    </div>
                    <div className={styles.component + ' ' + styles.info}>
                        <InfoClientComponent />
                    </div>
                    <div className={styles.logos}>
                        <div className="flex space-x-2 items-center justify-center">
                            <div>
                                <Image
                                    src="/imgs/redstoneaero.png"
                                    alt="Redstone Aero"
                                    width={150}
                                    height={30}
                                />
                            </div>
                            <div className=" bg-white h-auto flex items-center justify-center">
                                <Image
                                    src="/imgs/HH_logo_2020.png"
                                    alt="Haaga-Helia"
                                    width={60}
                                    height={30}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DataProvider>
    );
}
