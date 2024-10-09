// components/LoadingSpinner.js
import React from 'react';

// This component is used to display a loading spinner while the data is being fetched.
export default function LoadingSpinner() {
    return (
        <div className="p-6 rounded-lg shadow-lg flex items-center justify-center h-full">
            <svg
                className="animate-spin h-10 w-10 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
            </svg>
        </div>
    );
}
