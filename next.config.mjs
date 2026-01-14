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
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "plus.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i.ibb.co",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ibb.co",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "imgbb.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "www.imgbb.com",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
