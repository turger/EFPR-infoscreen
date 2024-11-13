import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            await sql`SET TIME ZONE 'UTC+2';`;

            const reportData = req.body;

            if (!reportData || !reportData.reportData) {
                return res
                    .status(400)
                    .json({ error: 'Report data is required' });
            }

            const report = reportData.reportData;

            await sql`INSERT INTO metar_reports (report_data) VALUES (${report});`;

            // Tarkistetaan, onko kello tasan (esim. 14:00, 15:00 jne.)
            const currentTime = new Date();
            const minutes = currentTime.getMinutes();

            if (minutes === 0) {
                // Tallennetaan raportti myÃ¶s metar_reports_perhour-tauluun
                await sql`INSERT INTO metar_reports_perhour (report_data) VALUES (${report});`;
            }

            return res
                .status(200)
                .json({ message: 'Report saved successfully' });
        } catch (error) {
            console.error('Error saving report:', error);
            return res.status(500).json({ error: 'Failed to save report' });
        }
    } else if (req.method === 'GET') {
        try {
            const results_15_minutes_ago = await sql`
            SELECT * FROM metar_reports
            WHERE created_at >= NOW() - INTERVAL '15 minutes'
            AND created_at < NOW() - INTERVAL '14 minutes';
        `;

            const results_1_hour_ago = await sql`
            SELECT * FROM metar_reports
            WHERE created_at >= NOW() - INTERVAL '60 minutes'
            AND created_at < NOW() - INTERVAL '59 minutes';
        `;

            const combinedResults = {
                results_15_minutes_ago: results_15_minutes_ago.rows,
                results_1_hour_ago: results_1_hour_ago.rows,
            };

            return res.status(200).json(combinedResults);
        } catch (error) {
            console.error('Error fetching reports:', error);
            return res.status(500).json({ error: 'Failed to fetch reports' });
        }
    } else {
        return res
            .setHeader('Allow', ['POST', 'GET'])
            .status(405)
            .end(`Method ${req.method} Not Allowed`);
    }
}
