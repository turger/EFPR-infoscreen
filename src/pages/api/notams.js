import * as cheerio from 'cheerio';

let cachedData = null;
let lastFetchTime = null;

export default async function GET(req, res) {
    const oneHour = 3600000; // One hour in milliseconds

    if (!lastFetchTime || Date.now() - lastFetchTime > oneHour) {
        const response = await fetch(
            //'https://lentopaikat.fi/notam/notam.php?a=EFIV',
            'https://lentopaikat.fi/notam/notam.php?a=EFPR',
            {
                headers: {
                    'Cache-Control': 'no-store',
                },
            }
        );

        if (!response.ok) {
            res.status(500).json({message: 'Failed to fetch NOTAM data'});
        }

        const htmlContent = await response.text();
        const $ = cheerio.load(htmlContent);
        const fullText = $('body').text();

        // Split at the first '+' and normalize
        const [titleRaw, ...contentParts] = fullText.split('+');
        const title = (titleRaw || '').trim();
        const content = contentParts
            .join('+')
            .trim()
            .replace(/\r/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n');

        cachedData = {title, content};
        lastFetchTime = Date.now();
    }

    res.status(200).json({data: cachedData});
}
