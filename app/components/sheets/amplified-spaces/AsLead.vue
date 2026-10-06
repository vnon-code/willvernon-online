<script setup lang="ts">
import type { SheetMediaItem, SheetStory } from '~/types/project'

// PROTOTYPE (overnight run, Amplified Spaces T1–T3): the block under the hero, shared by T1–T3 (not a variant; not
// in meta.json). A strip of media meeting the hero edge to edge (an index: each tile jumps to its beat), then T's
// intro: the hook large beside the metadata rail (brief + credits). The block fades in a beat later than the
// shell's build (a CSS delay on the outer element; the shell's own [data-build] fade sits on the inner one, so the
// close still fades it), so the words arrive once the hero has landed. An item's optional `short` (T2b) replaces its
// label on phones, so the chip stays one line. PLACEHOLDER: the strip, the delay.
defineProps<{ story: SheetStory, items: { m: SheetMediaItem, label: string, to: string, short?: string }[], count?: string }>()
const emit = defineEmits<{ go: [i: number] }>()

function go(to: string, i: number) {
  emit('go', i)
  const el = document.getElementById(to)
  if (!el) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
</script>

<template>
  <section class="ld" data-sheet-body data-sheet-block="lead">
    <div data-build>
      <nav class="ld__strip" :style="{ '--n': items.length }" aria-label="Jump to">
        <a v-for="(it, i) in items" :key="it.to" class="ld__tile" :href="`#${it.to}`" @click.prevent="go(it.to, i)">
          <SheetPic :m="it.m" />
          <span class="ld__label"><b>{{ pad(i) }}</b> <template v-if="it.short"><span class="ld__full">{{ it.label }}</span><span class="ld__short">{{ it.short }}</span></template><template v-else>{{ it.label }}</template></span>
        </a>
      </nav>
      <div class="ld__intro">
        <div class="ld__words">
          <h2 class="ld__title">
            {{ story.title }}
          </h2>
          <p class="ld__hook">
            {{ story.hook }}
          </p>
          <p v-if="story.intro" class="ld__muted">
            {{ story.intro }}
          </p>
        </div>
        <dl class="ld__meta">
          <div v-if="count">
            <dt>Beats</dt>
            <dd>{{ count }}</dd>
          </div>
          <div v-for="c in [...(story.brief ?? []).slice(0, 2), ...story.credits]" :key="c.k">
            <dt>{{ c.k }}</dt>
            <dd>{{ c.v }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ld {
  animation: ld-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 360ms both;
}

@keyframes ld-in {
  from { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ld { animation-duration: 1ms; }
}

.ld__strip {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}

.ld__tile {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  color: var(--c-fg);
  text-decoration: none;
  outline-offset: -3px;
}

.ld__tile + .ld__tile {
  border-left: 1px solid var(--rule);
}

.ld__tile .pic {
  position: absolute;
  inset: 0;
  transition: opacity 0.25s var(--ease-out);
}

.ld__tile:hover .pic,
.ld__tile:focus-visible .pic {
  opacity: 0.7;
}

.ld__label {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 4px 8px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

.ld__short {
  display: none;
}

.ld__label b {
  color: var(--c-accent);
  font-weight: 600;
}

.ld__intro {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px 48px;
  padding: 28px 24px 40px;
  border-top: 1px solid var(--rule);
}

.ld__words p {
  margin: 0;
}

.ld__title {
  margin: 0 0 18px;
  font: 500 13px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ld__hook {
  font: 600 34px/1.15 var(--font-ui);
  letter-spacing: -0.015em;
}

.ld__muted {
  margin-top: 16px !important;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.ld__meta {
  display: grid;
  align-content: start;
  margin: 0;
  border-left: 1px solid var(--rule);
}

.ld__meta div {
  padding: 8px 0 10px 20px;
}

.ld__meta div + div {
  border-top: 1px solid var(--rule);
}

.ld__meta dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ld__meta dd {
  margin: 6px 0 0;
  font: 400 14px/1.4 var(--font-ui);
}

@media (max-width: 720px) {
  .ld__intro {
    grid-template-columns: 1fr;
    padding: 22px 16px 28px;
  }

  .ld__hook {
    font-size: 26px;
  }

  .ld__meta {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .ld__meta div {
    padding-left: 0;
  }

  .ld__full {
    display: none;
  }

  .ld__short {
    display: inline;
    white-space: nowrap;
  }

  .ld__label {
    left: 6px;
    bottom: 6px;
    max-width: calc(100% - 12px);
    padding: 3px 6px;
  }

  /* The number on its own line, so a two-word title ("Fading Away") fits the tile */
  .ld__label b {
    display: block;
  }
}
</style>
