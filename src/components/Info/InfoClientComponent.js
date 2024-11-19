// InfoClinetComponent.js
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorComponent from '../ErrorComponent';

export default function InfoClientComponent() {
    const { data: session } = useSession();
    const [note, setNote] = useState('Write a note...');
    const [allNotes, setAllNotes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all notes from database
    useEffect(() => {
        fetchNotes();
    }, []);

    async function fetchNotes() {
        try {
            const response = await fetch('/api/infonote');
            const data = await response.json();
            //console.log(data);
            //console.log(data.notes);
            console.log(data.notes.rows);
            //console.log(data.rows);
            if (response.ok) {
                setAllNotes(data.notes.rows);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }

    const handleNoteChange = (e) => {
        setNote(e.target.value);
    };

    // Save the note to the database via the API
    const handleSaveNote = async () => {
        try {
            const response = await fetch('/api/infonote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note }),
            });

            if (!response.ok) {
                throw new Error('Failed to save note');
            }
            setIsEditing(false); // Hide the textarea after saving
        } catch (err) {
            setError('Failed to save note. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    /*     async function handleSaveNote() {
            if (!note) return; // Ensure note is not empty
    
            setIsLoading(true); // Set loading state
    
            try {
                const response = await fetch('/api/infonote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ note }) // Send the current note
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    // After saving, re-fetch notes to get the latest state
                    await fetchNotes();
                } else {
                    console.error(data.error);
                }
            } catch (error) {
                console.error('Error saving note:', error);
            } finally {
                setIsLoading(false); // Reset loading state after save attempt
            }
        } */

    if (error) {
        return <ErrorComponent message={error?.message} />;
    }
    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">EHA-Info</h1>
            {/* <p className="my-4">{note || 'No notes'}</p> */}
            {Array.isArray(allNotes) && allNotes.length > 0 ? (
                <ul>
                    {allNotes.map((note, index) => (
                        <li key={index} className="border-b py-2">
                            {note.note}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No notes.</p>
            )}
            {session ? (
                <div>
                    {isEditing ? (
                        <div>
                            <textarea
                                value={note}
                                onChange={handleNoteChange}
                                className="w-full p-2 border border-gray-300 rounded-md resize-none text-black"
                                rows={4}
                            />
                            <div className="flex justify-between mt-2">
                                <button
                                    onClick={handleSaveNote}
                                    disabled={isLoading}
                                    style={{ backgroundColor: '#fac807' }}
                                    className={`py-1 px-3 text-white rounded-md shadow-md text-xs ${isLoading
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-blue-500'
                                        }`}
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => signOut()}
                                    className="py-1 px-3 bg-gray-600 hover:bg-gray-500 text-white rounded-md shadow-md text-xs"
                                >
                                    Logout
                                </button>
                            </div>
                            {error && (
                                <p className="text-red-500 mt-2">{error}</p>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)} // Show textarea when editing
                            style={{ backgroundColor: '#fac807' }}
                            className="py-1 px-3 text-white rounded-md shadow-md hover:bg-yellow-400 text-xs"
                        >
                            Edit note
                        </button>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => signIn()}
                    style={{ backgroundColor: '#fac807' }}
                    className="py-1 px-3 text-white rounded-md shadow-md hover:bg-yellow-400 text-xs"
                >
                    Change note
                </button>
            )}
        </div>
    );
}
