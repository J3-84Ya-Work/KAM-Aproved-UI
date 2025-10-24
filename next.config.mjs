/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/appspecific/com.chrome.devtools.json",
        destination: "/chrome-devtools.json",
      },
    ]
  },
}

export default nextConfig
