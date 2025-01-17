// components/ErrorComponent.js
import React from 'react';
import {FaExclamationTriangle} from 'react-icons/fa';

// This component will be used to display an error message and icon when the data fails to load.
export default function ErrorComponent({message}) {
    return (
        <div className="p-6 rounded-lg shadow-lg flex items-center justify-center h-full">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
            <p className="text-red-500 ml-2">{message}</p>
        </div>
    );
}
