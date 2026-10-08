import { onBeforeUnmount, onMounted, type Ref } from 'vue'

// Videos marked [data-play] play only in view, and only once the Sheet is fully
// open and settled (1.2s on), so no video starts decoding during the open or close flight (the shell's usePlayInView
// starts them on mount; a second video decoding cost ~48 slow frames in the scorer). PLACEHOLDER: the 1.2s.
export function useOpenPlay(root: Ref<HTMLElement | undefined>) {
  let io: IntersectionObserver | undefined
  let mo: MutationObserver | undefined
  let timer = 0
  const html = import.meta.client ? document.documentElement : null
  const vids = () => [...root.value?.querySelectorAll<HTMLVideoElement>('video[data-play]') ?? []]

  function start() {
    if (io || !root.value) return
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement
        if (e.isIntersecting && html?.dataset.sheet === 'open') v.play().catch(() => {})
        else v.pause()
      }
    }, { root: root.value.closest('[data-sheet-layer]'), threshold: 0.25 })
    vids().forEach(v => io!.observe(v))
  }

  onMounted(() => {
    if (!html) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const later = () => (clearTimeout(timer), timer = window.setTimeout(start, 1200))
    mo = new MutationObserver(() => {
      if (html.dataset.sheet === 'open') later()
      else {
        clearTimeout(timer)
        io?.disconnect()
        io = undefined
        vids().forEach(v => v.pause())
      }
    })
    mo.observe(html, { attributes: true, attributeFilter: ['data-sheet'] })
    if (html.dataset.sheet === 'open') later()
  })
  onBeforeUnmount(() => {
    clearTimeout(timer)
    io?.disconnect()
    mo?.disconnect()
  })
}
