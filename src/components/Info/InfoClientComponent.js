// InfoClientComponent.js
'use client';

import {useEffect, useState} from 'react';
import {getInfoNotes} from '@/services/firebaseDB';

export default function InfoClientComponent() {
    const [allNotes, setAllNotes] = useState([]);

    useEffect(() => {
        const getNotes = async () => {
            const notesFromFB = await getInfoNotes();
            setAllNotes(notesFromFB);
        };
        getNotes();
    }, []);

    if (allNotes.length === 0) {
        return null;
    }

    return (
        <div className="p-1 relative h-full">
            <ul className="overflow-auto">
                {Array.isArray(allNotes) &&
                    allNotes.map((note) => (
                        <li
                            key={note}
                            className="py-1 text-sm flex items-center"
                        >
                            <span className="flex-1">{note}</span>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
