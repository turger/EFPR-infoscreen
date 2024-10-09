// components/camera/ExampleClientComponent.js
'use client';

import React, { memo } from 'react';

function ExampleClientComponent({ data }) {
    if (!data) return null; // If no data is passed, render nothing

    return (
        <div>
            <p className="text-sm text-gray-400">
                <strong>Example text</strong>
            </p>
        </div>
    );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ExampleClientComponent);
