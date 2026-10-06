import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

// PROTOTYPE (overnight run, The World Plays Here r2): true once the element has come into the Sheet's view (once).
// Under reduced motion it is true at once, so nothing waits on a reveal. Not a variant (only *.vue files are).
export function useSeen(el: Ref<HTMLElement | undefined>, threshold = 0.3) {
  const seen = ref(false)
  let io: IntersectionObserver | undefined
  onMounted(() => {
    if (!el.value) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      seen.value = true
      return
    }
    io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        seen.value = true
        io?.disconnect()
      }
    }, { root: el.value.closest('[data-sheet-layer]'), threshold })
    io.observe(el.value)
  })
  onBeforeUnmount(() => io?.disconnect())
  return seen
}
