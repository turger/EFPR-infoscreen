import { sql } from '@vercel/postgres';

/* export default async function infonoteHandler(request, response) {
    try {
        const note = request.query.note;
        if (!note) throw new Error('Note required');
        await sql`INSERT INTO notes (note) VALUES (${note});`;
    } catch (error) {
        return response.status(500).json({ error });
    }

    const infonotes = await sql`SELECT * FROM notes;`;
    return response.status(200).json({ infonotes });
} */
export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            // Post a note into the database
            const { note } = req.body;
            if (!note) throw new Error('Note is required');

            await sql`INSERT INTO notes (note) VALUES (${note});`;

            return res.status(200).json({ message: 'Note saved successfully' });
        } catch (error) {
            //console.error(error);
            return res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'GET') {
        try {
            // Get all notes from the database
            const notes = await sql`SELECT * FROM notes;`;
            return res.status(200).json({ notes });
        } catch (error) {
            //console.error(error);
            return res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'PATCH') {
        try {
            // Edit existing note in database
            const { id, note } = req.body;
            if (!id || !note) throw new Error('ID and Note are required');
            await sql`UPDATE notes SET note = ${note} WHERE id = ${id};`;
            return res
                .status(200)
                .json({ message: 'Note updated successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            // Delete selected note from database
            const { id } = req.body;
            if (!id) throw new Error('ID is required');
            await sql`DELETE FROM notes WHERE id = ${id};`;
            return res
                .status(200)
                .json({ message: 'Note deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // Handle other request methods
    return res.status(405).json({ error: 'Method not allowed' });
}
