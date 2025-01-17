// Data Context for ADS-B, Drone (and Airspaces?) data

import React, {createContext, useContext} from 'react';
import useSWR from 'swr';
import {fetcher} from '@/lib/fetcher';

const DataContext = createContext();

export function DataProvider({children}) {
    const {data: adsbData, error: adsbError} = useSWR('/api/adsb', fetcher, {
        refreshInterval: 4000, // 4 seconds
        dedupingInterval: 4000, // Prevent SWR from sending multiple requests at the same time
    });

    // console.log('*** adsbData', adsbData);

    return (
        <DataContext.Provider value={{adsbData, adsbError}}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
