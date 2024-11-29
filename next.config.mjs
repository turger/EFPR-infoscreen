/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname:
                    //change to actual hostname when known
                    'https://slgrxbwf84wyxoj6.public.blob.vercel-storage.com',
                port: '',
            },
        ],
    },
};

export default nextConfig;
