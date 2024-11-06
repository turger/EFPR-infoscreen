// InfoClinetComponent.js
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function InfoClientComponent() {
    const { data: session } = useSession();
    const [note, setNote] = useState('This is the info screen note');
    const [isEditing, setIsEditing] = useState(false);

    const handleNoteChange = (e) => {
        setNote(e.target.value);
    };

    const handleSaveNote = () => {
        setIsEditing(false); // Hide the textarea when saving
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">EHA-Info</h1>
            <p className="my-4">{note}</p>
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
                                    style={{ backgroundColor: '#fac807' }}
                                    className="py-1 px-3 hover:bg-blue-500 text-white rounded-md shadow-md text-xs"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => signOut()}
                                    className="py-1 px-3 bg-gray-600 hover:bg-gray-500 text-white rounded-md shadow-md text-xs"
                                >
                                    Logout
                                </button>
                            </div>
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
