/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/budgets/:path*',
          destination: 'http://localhost:5001/api/budgets/:path*',
        },
        {
          source: '/api/users/:path*',
          destination: 'http://localhost:5001/api/users/:path*',
        },
        {
          source: '/api/transactions/:path*',
          destination: 'http://localhost:5001/api/transactions/:path*',
        },
        {
          source: '/api/categories/:path*',
          destination: 'http://localhost:5001/api/categories/:path*',
        },
        {
          source: '/api/goals/:path*',
          destination: 'http://localhost:5001/api/goals/:path*',
        },
      ];
    },
  };
  
  module.exports = nextConfig;