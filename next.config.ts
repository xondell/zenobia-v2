import type { NextConfig } from 'next';
// https://nextjs.org/docs/app/guides/static-exports
const config: NextConfig = { output: 'export', images: { unoptimized: true }, devIndicators: false };
export default config;
