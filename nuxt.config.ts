// https://nuxt.com/docs/api/configuration/nuxt-config
import strip from './content/strip.json'

// One scrolling page (docs/adr/0002-one-scrolling-page.md): every Section path and Project Sheet path renders the same
// page, prerendered so each has its own file. PLACEHOLDER: the Section list mirrors SECTIONS in useScrollPage.ts.
const SECTION_PATHS = ['about', 'music', 'ai', 'contact'].map(s => `/${s}`)
const WORK_PATHS = strip.cards.map(c => `/work/${c.id}`)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Fully prerendered: `pnpm generate` writes static files to .output/public for Cloudflare Workers assets
  css: [
    '@fontsource-variable/host-grotesk',
    'lenis/dist/lenis.css',
    '~/assets/css/tokens.css',
  ],
  nitro: {
    prerender: { routes: ['/', ...SECTION_PATHS, ...WORK_PATHS] },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        // The monogram on a dark circle (Will, 2026-10-07)
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
})
