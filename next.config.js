/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Performance requirement (03-tech-stack.md): modern formats, properly sized.
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Tree-shake the animation layer's imports so unused GSAP plugins never reach the client bundle.
    optimizePackageImports: ['gsap', 'motion'],
  },
};

module.exports = nextConfig;
