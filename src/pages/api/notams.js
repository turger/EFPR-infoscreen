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
            /*return new Response(
                JSON.stringify({ message: 'Failed to fetch NOTAM data' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            */
            res.status(500).json({ message: 'Failed to fetch NOTAM data' });
        }

        const htmlContent = await response.text();
        const $ = cheerio.load(htmlContent);
        const title = $('p[style="font-size:20px"]').text().trim();
        const content = $('p[style="font-size:14px"]')
            .text()
            .trim()
            .replaceAll('?', '')
            .replaceAll('�', ' ');
        cachedData = { title, content };
        lastFetchTime = Date.now();
    }

    /*return new Response(JSON.stringify({ data: cachedData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });*/
    res.status(200)
        //.setHeaders({ 'Content-Type': 'application/json' })
        .json({ data: cachedData });
}
