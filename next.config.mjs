/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.prod.website-files.com', pathname: '/**' },
      { protocol: 'https', hostname: 'no-ideas-portfolio.nyc3.cdn.digitaloceanspaces.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/sanity-files/:path*',
        destination: 'https://cdn.sanity.io/files/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        // Allow Presentation to iframe the frontend locally and on Sanity-hosted Studio.
        source: '/((?!studio|api).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' http://localhost:3000 http://localhost:3333 http://127.0.0.1:3000 http://127.0.0.1:3333 https://*.sanity.io",
          },
        ],
      },
      {
        source: '/studio/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.sanity.io",
          },
        ],
      },
    ]
  },
};

export default nextConfig;

