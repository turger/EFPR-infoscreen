import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            // Insert a new note
            const { note } = req.body;
            if (!note) throw new Error('Note is required');
            await sql(`INSERT INTO notes (note) VALUES ($1)`, [note]);
            return res.status(200).json({ message: 'Note saved successfully' });
        } else if (req.method === 'GET') {
            // Fetch all notes
            const response = await sql`SELECT * FROM notes;`;
            return res.status(200).json({ response });
        } else if (req.method === 'PATCH') {
            // Edit a note
            const { id, note } = req.body;
            if (!id || !note) throw new Error('ID and Note are required');
            await sql(`UPDATE notes SET note = $1 WHERE id = $2`, [note, id]);
            return res
                .status(200)
                .json({ message: 'Note updated successfully' });
        } else if (req.method === 'DELETE') {
            // Delete a note
            const { id } = req.body;
            if (!id) throw new Error('ID is required');
            await sql(`DELETE FROM notes WHERE id = $1`, [id]);
            return res
                .status(200)
                .json({ message: 'Note deleted successfully' });
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
