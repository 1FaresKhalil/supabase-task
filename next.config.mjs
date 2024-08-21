/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import globImporter from 'node-sass-glob-importer';
import path from 'path';
import { fileURLToPath } from 'node:url';
import withSerwistInit from '@serwist/next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import createJiti from 'jiti';
import withNextIntl from 'next-intl/plugin';

const revision = crypto.randomUUID();

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti('./src/libs/Env');

const withNextIntlConfig = withNextIntl('./src/libs/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});
const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  reloadOnOnline: true,
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  additionalPrecacheEntries: [{ url: '/~offline', revision }],
});

/** @type {import('next').NextConfig} */

export default withSerwist(
  bundleAnalyzer(
    withNextIntlConfig({
      eslint: {
        dirs: ['.'],
      },
      sassOptions: {
        sourceMap: true,
        importer: globImporter(),
        includePaths: [path.join(process.cwd(), 'styles')],
      },
      poweredByHeader: false,
      reactStrictMode: true,
    }),
  ),
);
