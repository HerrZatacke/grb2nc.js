import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
