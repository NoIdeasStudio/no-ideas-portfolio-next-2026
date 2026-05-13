/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.prod.website-files.com', pathname: '/**' },
      { protocol: 'https', hostname: 'no-ideas-portfolio.nyc3.cdn.digitaloceanspaces.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/studio/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.sanity.io",
          },
        ],
      },
      // Presentation loads /, /info, etc. inside an iframe from /studio (same origin).
      // Some hosts default to X-Frame-Options: DENY, which breaks preview entirely.
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
};

export default nextConfig;

