// index.js is the main file for the InfoScreen page.
import Head from 'next/head';
import Image from 'next/image';

// Import only one component which handles the rest of the components which are related to the component.
import CameraServerComponent from '../components/example/ExampleServerComponent';
import MetarServerComponent from '@/components/metar/MetarServerComponent';
import RadarServerComponent from '@/components/rainRadar/RadarServerComponent';
import AdsbServerComponent from '@/components/adsb/AdsbServerComponent';
import RunwayServerComponent from '@/components/runway/RunwayServerComponent';
import NotamClientComponent from '@/components/notam/NotamClientComponent';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Head>
                <title>Info Demo</title>
                <meta name="description" content="Information Board Demo" />
            </Head>

            {/* Main container with two main divs side by side */}
            <div className="h-screen w-full flex justify-center items-center p-2 space-x-2">
                {/* Left Div */}
                <div className="w-3/5 h-full flex flex-row space-x-2">
                    {/* Left Container: Two components stacked vertically */}
                    <div className="flex flex-col justify-between w-2/5 h-full space-y-2">
                        {/* Top Component */}
                        <div className="bg-gray-700 rounded-lg shadow-lg p-2 h-1/2">
                            <RunwayServerComponent />
                            {/*Runway here */}
                        </div>

                        {/* Bottom Component */}
                        <div className="bg-gray-700 rounded-lg shadow-lg p-2 h-1/2">
                            {/* Weather here */}
                        </div>
                    </div>

                    {/*  Middle Container: Two components stacked vertically */}
                    <div className="flex flex-col justify-between w-3/5 h-full space-y-2">
                        {/* Top Component */}
                        <div className="bg-gray-700 rounded-lg shadow-lg p-2 h-1/2">
                            <RadarServerComponent />
                            {/*Radar here */}
                        </div>

                        {/* Bottom Component */}
                        <div className="bg-gray-700 rounded-lg shadow-lg p-2 h-1/2">
                            <AdsbServerComponent />
                            {/* ads-B here */}
                        </div>
                    </div>
                </div>

                {/* Right Div */}
                <div className="w-2/5 h-full flex flex-col justify-between space-y-2">
                    {/* Top: Two components stacked vertically */}

                    {/* Bottom: One component */}
                    <div className="bg-gray-700 rounded-lg shadow-lg p-2 h-[24%] w-full">
                        <MetarServerComponent />
                        {/* Airport Notes here */}
                    </div>
                    <div className="bg-gray-700 rounded-lg shadow-lg p-2 h-[38%] w-full">
                        <NotamClientComponent />
                        {/* Airport Notes here */}
                    </div>

                    {/* Bottom: Two components side by side, one small component under the right side component*/}
                    <div className="h-[38%] flex space-x-2 w-full">
                        <div className="bg-gray-700 rounded-lg shadow-lg p-2 w-1/2 h-full">
                            {/* Drone map here */}
                        </div>
                        {/* Bottom Right two components vertically stacked */}
                        <div className="w-1/2 flex flex-col space-y-2">
                            {/* Top Component */}
                            <div className="bg-gray-700 rounded-lg shadow-lg p-2 h-4/5">
                                <CameraServerComponent />
                            </div>
                            {/* Bottom Component */}
                            <div className="flex space-x-2  p-2">
                                <div className="p-1">
                                    <Image
                                        src="/imgs/redstoneaero.png"
                                        alt="Redstone Aero"
                                        width={120}
                                        height={80}
                                    />
                                </div>
                                <div className=" bg-white h-1/2 flex items-center justify-center">
                                    <Image
                                        src="/imgs/HH_logo_2020.png"
                                        alt="Haaga-Helia"
                                        width={70}
                                        height={120}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
