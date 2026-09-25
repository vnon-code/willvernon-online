// Site-wide data: nav items, socials, JSON-LD Person facts.
// Values copied from redesign/content/index.json / about.json nav + link lists.
// Never hand-retype copy — this file only reshapes what extraction already found.
// Social hrefs, the contact email, the default description and the logo are
// read from src/content (generated), not typed here.
import { site, home } from '../content';

const socialHref = (platform: string): string => {
  const hit = site.socials.find((s) => s.platform === platform);
  if (!hit) throw new Error(`site.json has no '${platform}' social`);
  return hit.href;
};

export interface NavItem {
  /** Clean path used as the canonical href, e.g. '/about'. */
  path: string;
  /** Legacy .html href — both resolve (wrangler html_handling: auto-trailing-slash). */
  legacyHref: string;
  /** Channel label shown as mono metadata, e.g. 'CH-01'. */
  channel: string;
  /** Current nav label. */
  label: string;
  /** Legacy bracketed label kept for parity (index.nav.009-012 style), where one exists. */
  legacyLabel?: string;
}

// Primary IA fix (Phase 2 scope): all 7 pages get top-level nav entries.
// Legacy nav only exposed Home/Work/Music/About; Projects/AI/Experiments were one
// level down. Every legacy nav label (index.nav.009-020) stays reachable via
// legacyHref + legacyLabel so parity holds even though the new nav's primary
// label text differs.
export const NAV_ITEMS: NavItem[] = [
  { path: '/', legacyHref: '/index.html', channel: 'CH-01', label: 'Home', legacyLabel: '[ HOME ]' },
  { path: '/work', legacyHref: '/work.html', channel: 'CH-02', label: 'Work', legacyLabel: '[ WORK ]' },
  { path: '/projects', legacyHref: '/projects.html', channel: 'CH-03', label: 'Projects' },
  { path: '/AI', legacyHref: '/AI.html', channel: 'CH-04', label: 'AI' },
  { path: '/experiments', legacyHref: '/experiments.html', channel: 'CH-05', label: 'Experiments' },
  { path: '/music', legacyHref: '/music.html', channel: 'CH-06', label: 'Music', legacyLabel: '[ MUSIC ]' },
  { path: '/about', legacyHref: '/about.html', channel: 'CH-07', label: 'About', legacyLabel: '[ ABOUT ]' },
];

export interface SocialLink {
  label: string;
  href: string;
  icon: 'instagram' | 'linkedin' | 'envelope' | 'soundcloud' | 'bandcamp' | 'tiktok';
}

// Collected from legacy nav header + contact section + about/music pages
// (redesign/content/*.json links[], deduped).
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', href: socialHref('instagram'), icon: 'instagram' },
  { label: 'LinkedIn', href: socialHref('linkedin'), icon: 'linkedin' },
  { label: 'Email', href: socialHref('email'), icon: 'envelope' },
  { label: 'SoundCloud', href: socialHref('soundcloud'), icon: 'soundcloud' },
  { label: 'Bandcamp', href: socialHref('bandcamp'), icon: 'bandcamp' },
];

export const CONTACT_EMAIL = socialHref('email').replace(/^mailto:/, '');
export const CV_REQUEST_EMAIL = `mailto:${CONTACT_EMAIL}?subject=CV%20Request%3A%20William%20Vernon`;

/** Nav logo (WV monogram): src + legacy alt from site.json. */
export const LOGO = site.logo;

export const SITE = {
  name: 'William Vernon',
  url: 'https://willvernon.online',
  defaultDescription: home.blocks.find((b) => b.tag === 'p.hero-desc')!.text,
  defaultOgImage: '/img/3D_preview.jpeg',
  themeColor: '#050505',
};

// JSON-LD Person — schema.org sameAs list. Sourced from the legacy nav/contact
// social links across index/about/music (Instagram, LinkedIn, SoundCloud,
// Bandcamp, TikTok). Email intentionally excluded from sameAs (goes in `email`).
export const PERSON_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'William Vernon',
  url: SITE.url,
  email: CONTACT_EMAIL,
  sameAs: ['instagram', 'linkedin', 'soundcloud', 'bandcamp', 'tiktok'].map(socialHref),
};
