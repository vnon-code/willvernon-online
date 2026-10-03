// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Fully prerendered: `pnpm generate` writes static files to .output/public for Cloudflare Workers assets
  css: [
    '@fontsource-variable/host-grotesk',
    '@fontsource-variable/archivo/wdth.css',
    '~/assets/css/tokens.css',
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
