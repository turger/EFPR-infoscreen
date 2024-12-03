import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const reportData = req.body;

            if (!reportData || !reportData.reportData) {
                return res
                    .status(400)
                    .json({ error: 'Report data is required' });
            }

            const report = reportData.reportData;

            // Get the start and end of the current minute
            const currentTime = new Date();
            const minuteStart = new Date(
                currentTime.setSeconds(0, 0)
            ).toISOString();
            const minuteEnd = new Date(
                currentTime.setSeconds(59, 999)
            ).toISOString();

            // Check if a report already exists for this minute
            const { data: existingReports, error: fetchError } = await supabase
                .from('metar_reports')
                .select('id')
                .gte('created_at', minuteStart) // gte = >= subabase stuff i guess
                .lte('created_at', minuteEnd); // lte = <=

            if (fetchError) {
                throw fetchError;
            }

            if (existingReports.length > 0) {
                return res
                    .status(200)
                    .json({ message: 'Report for this minute already exists' });
            }

            // Insert the report into the metar_reports table
            const { error: insertError } = await supabase
                .from('metar_reports')
                .insert([{ report_data: report }]);

            if (insertError) {
                throw insertError;
            }

            // If it's the top of the hour, insert into metar_reports_perhour table
            const minutes = currentTime.getMinutes();

            if (minutes === 0) {
                const { error: hourlyInsertError } = await supabase
                    .from('metar_reports_perhour')
                    .insert([{ report_data: report }]);

                if (hourlyInsertError) {
                    throw hourlyInsertError;
                }
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
            // Fetch records from 15 minutes ago
            const { data: results_15_minutes_ago, error: fetchError15 } =
                await supabase
                    .from('metar_reports')
                    .select('*')
                    .gte(
                        'created_at',
                        new Date(Date.now() - 15 * 60 * 1000).toISOString()
                    )
                    .lt(
                        'created_at',
                        new Date(Date.now() - 14 * 60 * 1000).toISOString()
                    );

            if (fetchError15) {
                throw fetchError15;
            }

            // Fetch records from 1 hour ago
            const { data: results_1_hour_ago, error: fetchError1Hour } =
                await supabase
                    .from('metar_reports')
                    .select('*')
                    .gte(
                        'created_at',
                        new Date(Date.now() - 60 * 60 * 1000).toISOString()
                    )
                    .lt(
                        'created_at',
                        new Date(Date.now() - 59 * 60 * 1000).toISOString()
                    );

            if (fetchError1Hour) {
                throw fetchError1Hour;
            }

            const combinedResults = {
                results_15_minutes_ago,
                results_1_hour_ago,
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
