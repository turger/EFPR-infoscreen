import fs from 'fs';
import path from 'path';

// API route to serve radar images
export default function handler(req, res) {
    const {filename} = req.query;

    const filePath = path.join(
        process.cwd(),
        'storage',
        'radarImages',
        filename
    );

    try {
        const imageBuffer = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        res.status(404).json({error: 'Image not found'});
    }
}
