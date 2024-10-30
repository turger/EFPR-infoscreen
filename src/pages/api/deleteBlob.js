import { del } from '@vercel/blob';

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get('url');
    await del(urlToDelete);

    return new Response();
}
