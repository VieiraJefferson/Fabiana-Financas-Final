/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:5001/api/users/:path*',
      },
      {
        source: '/api/transactions/:path*',
        destination: 'http://localhost:5001/api/transactions/:path*',
      },
    ]
  },
};

module.exports = nextConfig; 