// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// export default async function handler(req, res) {
//     try {
//         if (req.method === 'POST') {
//             // Insert a new note
//             const { note } = req.body;
//             if (!note) throw new Error('Note is required');
//             const { data, error } = await supabase
//                 .from('notes')
//                 .insert([{ note }]);
//             if (error) {
//                 return res.status(500).json({ error: error.message });
//             }
//             return res
//                 .status(200)
//                 .json({ message: 'Note saved successfully', data });
//         } else if (req.method === 'GET') {
//             // Fetch all notes
//             const { data, error } = await supabase.from('notes').select('*');
//             if (error) {
//                 return res.status(500).json({ error: error.message });
//             }
//             return res.status(200).json({ notes: data });
//         } else if (req.method === 'PATCH') {
//             // Edit a note
//             const { id, note } = req.body;
//             if (!id || !note) throw new Error('ID and Note are required');
//             const { data, error } = await supabase
//                 .from('notes')
//                 .update({ note })
//                 .eq('id', id);
//             if (error) {
//                 return res.status(500).json({ error: error.message });
//             }
//             return res.status(200).json({
//                 message: 'Note updated successfully with message',
//                 data,
//             });
//         } else if (req.method === 'DELETE') {
//             // Delete a note
//             const { id } = req.body;
//             if (!id) throw new Error('ID is required');
//             const { data, error } = await supabase
//                 .from('notes')
//                 .delete()
//                 .eq('id', id);
//             if (error) {
//                 return res.status(500).json({ error: error.message });
//             }
//             return res
//                 .status(200)
//                 .json({ message: 'Note deleted successfully' });
//         } else {
//             return res.status(405).json({ error: 'Method not allowed' });
//         }
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// }
