/** @type {import('next').NextConfig} */
const nextConfig = {
  // API Proxy - Redirect API calls to backend (exceto NextAuth)
  async rewrites() {
    const backendUrl = process.env.NEXTAUTH_BACKEND_URL || 'http://localhost:5001';
    return [
      {
        source: '/api/users/:path*',
        destination: `${backendUrl}/api/users/:path*`,
      },
      {
        source: '/api/transactions/:path*',
        destination: `${backendUrl}/api/transactions/:path*`,
      },
      {
        source: '/api/categories/:path*',
        destination: `${backendUrl}/api/categories/:path*`,
      },
      {
        source: '/api/goals/:path*',
        destination: `${backendUrl}/api/goals/:path*`,
      },
      {
        source: '/api/budgets/:path*',
        destination: `${backendUrl}/api/budgets/:path*`,
      },
    ];
  },
  
  // Compress responses
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

export default nextConfig; 