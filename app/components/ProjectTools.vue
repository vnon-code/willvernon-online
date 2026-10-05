<script setup lang="ts">
// The centred project's tool logos, under the centre card's right edge (Will, 2026-10-05; picked on /proto):
// "tiles", one square plate per logo, as tall as the tag plate (--side-h, set by TheProjectStrip). At most 4.
// Will, 2026-10-05: the plates are solid; on hover the logo grows to fill its plate and a caption with the tool's name
// drops below it.
const props = defineProps<{ card: { id: string, from: string, tools: string[] } }>()

// Tool logos we hold (public/img/logos, app-icon tiles); anything else shows a two-letter tile. AI entries carry
// style tags too ("Oceanic Scale"), so for them only real tools are kept.
const LOGOS: [RegExp, string, string][] = [
  [/blender/i, 'Blender', 'Blender.png'],
  [/touchdesigner/i, 'TouchDesigner', 'TouchDesigner.png'],
  [/midjourney/i, 'Midjourney', 'Midjourney.png'],
  [/flux/i, 'Flux', 'Black Forest Labs Flux.png'],
  [/stable diffusion|sdxl/i, 'Stable Diffusion', 'Stability AI SDXL.png'],
  [/comfyui/i, 'ComfyUI', 'ComfyUI.png'],
  [/hidream/i, 'HiDream', 'HiDream AI.png'],
  [/gemini/i, 'Gemini', 'Google Gemini.png'],
  [/antigravity/i, 'Antigravity', 'Google Anti-Gravity.png'],
  [/firefly/i, 'Firefly', 'Adobe Firefly.png'],
  [/eleven/i, 'ElevenLabs', 'Eleven Labs.png'],
  // Adobe app icons (Wikimedia Commons, 2020 set). Adobe's policy bars third-party use of its icons without a
  // partnership; Will chose to use them for now (2026-10-05)
  [/after effects/i, 'After Effects', 'Adobe After Effects.svg'],
  [/premiere/i, 'Premiere Pro', 'Adobe Premiere Pro.svg'],
  [/photoshop/i, 'Photoshop', 'Adobe Photoshop.svg'],
  [/illustrator/i, 'Illustrator', 'Adobe Illustrator.svg'],
]
const AI_TOOLS_WITHOUT_LOGO = /luma/i
// Tools without a logo: a two-letter tile
const abbr = (t: string) => t.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
const tools = computed(() => props.card.tools.flatMap((t) => {
  const hit = LOGOS.find(([re]) => re.test(t))
  if (hit) return [{ name: hit[1], src: `/img/logos/${hit[2]}`, abbr: '' }]
  if (props.card.from === 'ai' && !AI_TOOLS_WITHOUT_LOGO.test(t)) return []
  return [{ name: t, src: '', abbr: abbr(t) }]
}).slice(0, 4))
</script>

<template>
  <HugBox :k="card.id" pin="right" bare data-dot-clear>
    <ul class="tools" aria-label="Tools">
      <li v-for="t in tools" :key="t.name">
        <img v-if="t.src" :src="t.src" :alt="t.name" width="18" height="18">
        <abbr v-else class="abbr" :aria-label="t.name">{{ t.abbr }}</abbr>
        <span class="tip" aria-hidden="true">{{ t.name }}</span>
      </li>
    </ul>
  </HugBox>
</template>

<style scoped>
.tools {
  display: flex;
  align-items: center;
  gap: var(--tile-gap, 4px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tools li {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: var(--side-h, 36px);
  height: var(--side-h, 36px);
  position: relative;
  background: var(--plate-solid);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: var(--side-r, 7px);
}

/* The caption: a small solid plate under the tile. PLACEHOLDER: gap, timing */
.tip {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  padding: 4px 8px;
  font: 500 11px/1 var(--font-ui);
  white-space: nowrap;
  color: var(--c-fg);
  background: var(--plate-solid);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
  pointer-events: none;
  opacity: 0;
  translate: -50% -4px;
  transition: opacity 160ms ease-out, translate 200ms var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .tools li:hover img,
  .tools li:hover .abbr {
    width: calc(var(--side-h, 36px) - 2px);
    height: calc(var(--side-h, 36px) - 2px);
    border-radius: calc(var(--side-r, 7px) - 1px);
  }

  .tools li:hover .tip {
    opacity: 1;
    translate: -50% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tip {
    transition: opacity 160ms ease-out;
  }

  .tools img,
  .abbr {
    transition: none;
  }
}

.tools img,
.abbr {
  display: block;
  width: var(--icon, 18px);
  height: var(--icon, 18px);
  object-fit: contain; /* the Adobe icons aren't quite square */
  border-radius: 5px;
  transition: width 200ms var(--ease-out-expo), height 200ms var(--ease-out-expo), border-radius 200ms var(--ease-out-expo);
}

.abbr {
  display: grid;
  place-items: center;
  font: 600 calc(var(--icon, 18px) * 0.45)/1 var(--font-ui);
  color: var(--c-fg);
  text-decoration: none;
  border: 1px solid color-mix(in srgb, var(--c-fg) 18%, transparent);
}
</style>
