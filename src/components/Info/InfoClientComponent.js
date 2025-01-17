// InfoClientComponent.js
'use client';

import {useEffect, useState} from 'react';
import {getInfoNotes} from '@/services/firebaseDB';
import styles from './info.module.css';

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
        <div className={styles.infoNoteContainer}>
            <ul className="overflow-auto">
                {Array.isArray(allNotes) &&
                    allNotes.map((note) => (
                        <li key={note} className={styles.infoNoteItem}>
                            <span className="flex-1">{note}</span>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
