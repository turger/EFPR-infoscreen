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

export default function Home() {
    return (
        <DataProvider>
            <div className="min-h-screen bg-[#292928] text-[#fac807]">
                <Head>
                    <title>Helsinki-East Aerodrome Info</title>
                    <meta
                        name="description"
                        content="Information Board For Helsinki-East Aerodrome"
                    />
                </Head>

                {/* Main container with two main divs side by side */}
                <div className="h-screen w-full flex justify-center items-center p-2 space-x-2">
                    {/* Left Div */}
                    <div className="w-3/5 h-full flex flex-row space-x-2">
                        {/* Left Container: Two components stacked vertically */}
                        <div className="flex flex-col justify-between w-2/5 h-full space-y-2">
                            {/* Top Component */}
                            <div className="flex items-center justify-center h-[3%] p-0">
                                <h1 className="text-center text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-[#fac807]">
                                    Helsinki-East Aerodrome Info
                                </h1>
                            </div>

                            <div className="bg-[#6c7460] rounded-lg shadow-lg p-0 h-[45.5%]">
                                <RunwayServerComponent />
                            </div>

                            {/* Bottom Component */}
                            <div className="bg-[#6c7460] rounded-lg shadow-lg p-2 h-[49.5%]">
                                <WeatherServerComponent />
                            </div>
                        </div>

                        {/*  Middle Container: Two components stacked vertically */}
                        <div className="flex flex-col justify-between w-3/5 h-full space-y-2">
                            {/* Top Component */}
                            <div className="bg-[#6c7460] rounded-lg shadow-lg p-2 h-1/2">
                                <RadarServerComponent />
                            </div>

                            {/* Bottom Component */}
                            <div className="bg-[#6c7460] rounded-lg shadow-lg p-2 h-1/2">
                                <AdsbServerComponent />
                            </div>
                        </div>
                    </div>

                    {/* Right Div */}
                    <div className="w-2/5 h-full flex flex-col justify-between space-y-2">
                        {/* Top: Two components stacked vertically */}

                        {/* Bottom: One component */}
                        <div className="bg-[#6c7460] rounded-lg shadow-lg p-2 h-[24%] w-full">
                            {<MetarServerComponent />}
                        </div>
                        <div className="bg-[#6c7460] rounded-lg shadow-lg p-2 h-[38%] w-full">
                            <NotamClientComponent />
                        </div>

                        {/* Bottom: Two components side by side, one small component under the right side component*/}
                        <div className="h-[38%] flex space-x-2 w-full">
                            <div className="bg-[#6c7460] rounded-lg shadow-lg p-2 w-1/2 h-full">
                                <DroneServerComponent />
                            </div>
                            {/* Bottom Right two components vertically stacked */}
                            <div className="w-1/2 flex flex-col space-y-2">
                                {/* Top Component */}
                                <div className="bg-[#6c7460] rounded-lg shadow-lg p-2 h-[90%]">
                                    {/* <CameraServerComponent /> */}
                                    <InfoClientComponent />
                                </div>
                                {/* Bottom Component */}
                                <div className="flex space-x-2 items-center justify-center">
                                    <div>
                                        <Image
                                            src="/imgs/redstoneaero.png"
                                            alt="Redstone Aero"
                                            width={220}
                                            height={190}
                                        />
                                    </div>
                                    <div className=" bg-white h-auto flex items-center justify-center">
                                        <Image
                                            src="/imgs/HH_logo_2020.png"
                                            alt="Haaga-Helia"
                                            width={120}
                                            height={140}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DataProvider>
    );
}
