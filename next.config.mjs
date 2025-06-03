/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Enable caching for faster builds
    config.cache = true;

    // Enable source maps for development (optional)
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'eval-source-map'; // Fastest option for development
    } else {
      config.devtool = false; // Disable source maps in production
    }

    // Optimize chunk splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 500000, // 500KB (increase chunk size to reduce the number of chunks)
      minSize: 100000, // 100KB (prevent too small chunks)
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    };

    // Only for the client-side bundle
    if (!isServer) {
      // Make Node.js modules empty or provide polyfills
      config.resolve.fallback = {
        fs: false,
        path: false,
        stream: false,
        zlib: false
      };
    }

    return config;
  },
  images: {
    // Enable image optimization for better performance
    unoptimized: false,
    formats: ['image/webp'], // Serve modern image formats
    deviceSizes: [320, 420, 768, 1024, 1200], // Optimize for common device sizes
    imageSizes: [16, 32, 48, 64, 96], // Optimize for common image sizes
  },
  // Enable React Strict Mode for better debugging
  reactStrictMode: true,
  // Enable SWC minification for faster builds
  swcMinify: true,
};

// Use ESM export syntax instead of CommonJS
export default nextConfig;