/** @type {import('next').NextConfig} */
const nextConfig = {
    // Эта конфигурация позволяет использовать внешние изображения, если понадобится.
    // Пока мы генерируем аватарки, это не строго необходимо, но полезно на будущее.
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
        ],
    },
};

export default nextConfig;
