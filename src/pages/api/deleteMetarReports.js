import { sql } from '@vercel/postgres';

export default async function deleteHandler(req, res) {
    if (req.method === 'POST') {
        try {
            await sql`DELETE FROM metar_reports
                WHERE created_at < NOW() - INTERVAL '1 days';
            `;
            return res
                .status(200)
                .json({ message: 'Old reports deleted successfully' });
        } catch (error) {
            console.error('Error deleting report:', error);
            return res.status(500).json({ error: 'Failed to delete reports' });
        }
    } else {
        return res
            .setHeader('Allow', ['POST'])
            .status(405)
            .end(`Method ${req.method} Not Allowed`);
    }
}
