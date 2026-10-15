import type { NextConfig } from 'next';
import { BASE_PATH } from './src/lib/asset-path';
// https://nextjs.org/docs/app/guides/static-exports
const config: NextConfig = { output: 'export', basePath: BASE_PATH, trailingSlash: true, images: { unoptimized: true }, devIndicators: false };
export default config;
