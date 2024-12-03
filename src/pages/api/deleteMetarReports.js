import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function deleteHandler(req, res) {
    if (req.method === 'POST') {
        try {
            // Delete records older than 1 day
            const { error } = await supabase
                .from('metar_reports')
                .delete()
                .lt(
                    'created_at',
                    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                ); // lt =

            if (error) {
                throw error;
            }

            return res
                .status(200)
                .json({ message: 'Old reports deleted successfully' });
        } catch (error) {
            console.error('Error deleting reports:', error);
            return res.status(500).json({ error: 'Failed to delete reports' });
        }
    } else {
        return res
            .setHeader('Allow', ['POST'])
            .status(405)
            .end(`Method ${req.method} Not Allowed`);
    }
}
