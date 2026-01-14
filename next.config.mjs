/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                // port: '',
                pathname: '/dzpvtuppu/image/upload/**',
                search: '',
            },
        ],
    },
};

export default nextConfig;
