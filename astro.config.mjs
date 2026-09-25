// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output only: Workers static assets serve dist/. build.format 'file'
// emits /about.html etc. so every legacy URL keeps resolving.
export default defineConfig({
  site: 'https://willvernon.online',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(styleguide|404)(\.html)?$/.test(page),
    }),
  ],
  prefetch: false,
  // Never inline assets as data: URIs (the small cyrillic-ext woff2 was),
  // because the CSP font-src is 'self' only. Every font goes to /_astro.
  vite: { build: { assetsInlineLimit: 0 } },
});
