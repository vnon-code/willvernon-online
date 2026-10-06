<script setup lang="ts">
// A corner drawer for the Landing's mixers (Will, 2026-10-04): music bottom right, visuals bottom left.
// Closed, only its tab shows at the bottom edge; open, the panel slides up under the tab. The panel is a row of
// bands with a foot row underneath, the same size in both drawers. The Build entrance (docs/specs/sound-hud.md)
// plays its glass fade on the first open; every open slides on the iOS drawer curve and the bands rise in one after
// another ("cascade", Will, 2026-10-05). On phones the drawers are full width, so opening one closes the other.
// PLACEHOLDER: the tab's look is Claude's pick.
const props = defineProps<{ id: string, side: 'left' | 'right', label: string }>()
const emit = defineEmits<{ firstOpen: [] }>()

const drawers = useState<Record<string, boolean>>('drawers', () => ({}))
const open = computed(() => !!drawers.value[props.id])
const built = ref(false)
const dockEl = ref<HTMLElement>()
const { sfx } = useSound()

function toggle() {
  const next = !open.value
  if (next && matchMedia('(max-width: 640px)').matches) for (const k in drawers.value) drawers.value[k] = false
  drawers.value[props.id] = next
  sfx(next ? 'drawerOpen' : 'drawerClose')
  if (next && !built.value) {
    built.value = true
    emit('firstOpen')
  }
}
function onKey(e: KeyboardEvent) {
  // inert (the Sheet is open) doesn't stop window listeners, so Escape there would close this too
  if (e.key === 'Escape' && open.value && !dockEl.value?.closest('[inert]')) toggle()
}
onMounted(() => addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  removeEventListener('keydown', onKey)
  drawers.value[props.id] = false
})
</script>

<template>
  <!-- PROTOTYPE data-drop (Project Sheet rework): the drawer drops away while a Sheet is open -->
  <div ref="dockEl" class="dock" :class="[`dock--${side}`, { 'dock--open': open }]" :data-drop="open ? 'hud' : 'hud-closed'">
    <button
      class="dock__tab"
      type="button"
      data-dot-clear
      :aria-expanded="open"
      :aria-controls="id"
      :aria-label="`${open ? 'Close' : 'Open'} ${label.toLowerCase()}`"
      @click="toggle"
    >
      <slot name="icon" />
    </button>
    <section
      :id="id"
      class="panel"
      :class="{ 'panel--built': built }"
      :inert="!open"
      :data-dot-clear="open ? '' : undefined"
      :aria-label="label"
    >
      <div class="panel__bands">
        <slot name="bands" />
      </div>
      <div class="panel__foot">
        <slot name="foot" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.dock {
  --tab-h: 28px;
  --line: color-mix(in srgb, var(--c-fg) 18%, transparent);
  --hud-line: var(--line); /* SoundBand reads these two */
  --hud-muted: color-mix(in srgb, var(--c-fg) 72%, transparent);
  position: fixed;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
  pointer-events: none; /* on phones both docks span the width; only the tab and panel take clicks */
  transform: translateY(calc(100% - var(--tab-h)));
  transition: transform 420ms cubic-bezier(0.32, 0.72, 0, 1); /* the iOS drawer curve */
}

.dock--left {
  left: 16px;
  align-items: flex-start;
}

.dock--right {
  right: 16px;
  align-items: flex-end;
}

.dock--open {
  transform: none;
}

.dock__tab,
.panel {
  pointer-events: auto;
}

.dock__tab {
  display: grid;
  place-items: center;
  width: 56px;
  height: var(--tab-h);
  margin-bottom: -1px; /* shares the panel's top border */
  padding: 0;
  color: var(--c-fg);
  background: var(--c-bg); /* dark like the buttons, not grey (Will, 2026-10-06) */
  border: 1px solid;
  border-color: var(--edges);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  animation: drawer-rise 0.6s var(--ease-out-expo) both;
  transition: background-color 0.16s ease;
}

.dock__tab :slotted(svg) {
  transition: transform 0.2s var(--ease-out);
}

.dock__tab:active :slotted(svg) {
  transform: scale(0.9);
}

.dock__tab:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .dock__tab:hover {
    background: color-mix(in srgb, var(--c-fg) 14%, var(--c-bg));
  }

  .dock__tab:hover :slotted(svg) {
    transform: translateY(-1px);
  }
}

.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  transition: visibility 0s;
}

/* Closed, the panel's top border would peek out as a hairline beside the tab: hide it once the slide ends */
.dock:not(.dock--open) .panel {
  visibility: hidden;
  transition-delay: 420ms;
}

/* The glass sits on its own layer so it can fade in before the bands build */
.panel::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--c-bg); /* dark like the buttons, not grey (Will, 2026-10-06) */
  border: 1px solid;
  border-color: var(--edges);
}

.panel__bands {
  display: flex;
  gap: 4px;
}

.panel__bands :deep(.drawer-divider) {
  flex: none;
  width: 1px;
  margin: 0 4px;
  background: var(--line);
}

.panel__foot {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  padding-top: 6px;
  border-top: 1px solid var(--line);
}

/* First open: the glass and the divider fade in */
.panel--built::before {
  animation: drawer-fade 0.5s ease-out both;
}

.panel--built .panel__bands :deep(.drawer-divider) {
  animation: drawer-fade 0.4s ease-out 0.3s both;
}

/* Every open: the bands rise in 24ms apart (each sets --i), then the foot */
.dock--open .panel__bands :deep(.band) {
  animation: drawer-cascade 336ms var(--ease-out) calc(80ms + var(--i, 0) * 24ms) both;
}

.dock--open .panel__foot {
  animation: drawer-cascade 336ms var(--ease-out) 160ms both;
}

@keyframes drawer-fade {
  from { opacity: 0; }
}

@keyframes drawer-rise {
  from { opacity: 0; translate: 0 10px; }
}

@keyframes drawer-cascade {
  from { opacity: 0; transform: translateY(6px); }
}

/* Reduced motion: no slide; the panel fades in and out with the bands already built */
@media (prefers-reduced-motion: reduce) {
  .dock {
    transition: none;
  }

  .panel {
    transition: opacity 0.2s ease, visibility 0s;
  }

  .dock:not(.dock--open) .panel {
    opacity: 0;
    transition-delay: 0s, 0.2s;
  }

  .dock__tab {
    animation: drawer-fade 0.3s ease-out both;
  }

  .panel--built::before,
  .panel--built .panel__bands :deep(.drawer-divider),
  .dock--open .panel__bands :deep(.band),
  .dock--open .panel__foot {
    animation: none;
  }
}

/* Phones: full width, so opening one drawer closes the other; tabs stay in their corners */
@media (max-width: 640px) {
  .dock {
    left: 16px;
    right: 16px;
  }

  .panel {
    align-self: stretch;
  }
}
</style>
