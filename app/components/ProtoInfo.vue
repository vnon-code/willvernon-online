<script setup lang="ts">
// PROTOTYPE (/proto) — throwaway. The project's tool logos in a glass box that hugs them (ProtoHug): beside or under the
// centred name, or inside the centre card (the Tools row; Will, 2026-10-05).
// No thumbnail (Will). Every value here is a PLACEHOLDER until Will picks one.
type Card = { id: string, from: string, tools: string[] }
const props = defineProps<{ card: Card, dir?: number }>()

// Tool logos we hold (public/img/logos, app-icon tiles); anything else shows its name. AI entries carry style tags
// too ("Oceanic Scale"), so for them only real tools are kept.
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
]
const AI_TOOLS_WITHOUT_LOGO = /luma/i
// Tools with no logo yet get a two-letter tile, Adobe-style (layout search round 2: names overflowed narrow boxes)
const ABBR: Record<string, string> = { 'After Effects': 'Ae', 'Premiere Pro': 'Pr', 'Photoshop': 'Ps', 'Illustrator': 'Ai' }
const abbr = (t: string) => ABBR[t] ?? t.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
const tools = computed(() => props.card.tools.flatMap((t) => {
  const hit = LOGOS.find(([re]) => re.test(t))
  if (hit) return [{ name: hit[1], src: `/img/logos/${hit[2]}`, abbr: '' }]
  if (props.card.from === 'ai' && !AI_TOOLS_WITHOUT_LOGO.test(t)) return []
  return [{ name: t, src: '', abbr: abbr(t) }]
}).slice(0, 4))
</script>

<template>
  <ProtoHug :k="card.id" :dir="dir" class="pi" data-dot-clear>
    <ul class="tools" aria-label="Tools">
      <li v-for="(t, i) in tools" :key="t.name" :title="t.name" :style="{ '--i': i }">
        <img v-if="t.src" :src="t.src" :alt="t.name" width="20" height="20">
        <abbr v-else class="tile" :aria-label="t.name">{{ t.abbr }}</abbr>
      </li>
    </ul>
  </ProtoHug>
</template>

<style scoped>
/* Placed by TheProjectStrip (the Tools row) */
.pi {
  --line: color-mix(in srgb, var(--c-fg) 18%, transparent);
  flex: none;
}

.tools {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: calc((var(--side-h, 42px) - 2px - var(--icon, 20px)) / 2) 12px; /* the strip's Sides row */
  list-style: none;
}

.tools li {
  display: flex;
}

/* PROTOTYPE 'stagger': the logos rise in one after another as the box re-fits */
:root[data-fx-change='stagger'] .tools li {
  animation: tool-rise var(--fx-enter, 240ms) var(--ease-out) calc(var(--i) * var(--fx-stagger, 40ms)) both;
}

@keyframes tool-rise {
  from { opacity: 0; transform: translateY(var(--fx-rise, 6px)); }
}

@media (prefers-reduced-motion: reduce) {
  :root[data-fx-change='stagger'] .tools li {
    animation-name: tool-fade;
  }

  @keyframes tool-fade {
    from { opacity: 0; }
  }
}

.tile {
  display: grid;
  place-items: center;
  width: var(--icon, 20px);
  height: var(--icon, 20px);
  font: 600 calc(var(--icon, 20px) * 0.45)/1 var(--font-ui);
  color: var(--c-fg);
  text-decoration: none;
  border: 1px solid var(--line);
  border-radius: 5px;
}

.tools img {
  display: block;
  width: var(--icon, 20px);
  height: var(--icon, 20px);
  border-radius: 5px;
}
</style>
