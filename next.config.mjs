/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.prod.website-files.com', pathname: '/**' },
      { protocol: 'https', hostname: 'no-ideas-portfolio.nyc3.cdn.digitaloceanspaces.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
    ],
  },
};

export default nextConfig;

