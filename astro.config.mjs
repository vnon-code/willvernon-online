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
});
