/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for static export if needed for casting
  output: 'standalone',
  
  // Disable server-side features we don't need
  reactStrictMode: true,
}

module.exports = nextConfig
