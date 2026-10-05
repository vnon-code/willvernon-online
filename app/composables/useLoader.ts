import stems from '~~/content/stems.json'

// Real load progress for the Gate (docs/specs/gate.md, "Loading"):
// fonts, the first project's poster (the dot background's first palette until its teaser plays), and the opening track's stems.
// A failed asset counts as done, so the site can always be entered.

export const FIRST_PROJECT = {
  image: '/img/posters/assets-vidsmugglersoutpost-1.webp',
}

// The Gate sets everything in 600 (the quiet link in 500). One variable file covers 300–800, so both resolve to it.
const FONTS = ['600 1em "Host Grotesk Variable"', '500 1em "Host Grotesk Variable"']
const FONT_WEIGHT = 50_000 // bytes credited per font, so they carry a sensible share of the bar

interface Task { total: number, done: number }

const progress = ref(0) // 0–100, never goes backwards
const ready = computed(() => progress.value >= 100)
const objectUrls = reactive<Record<string, string>>({})
let started = false

function startLoading() {
  if (started) return
  started = true
  const tasks: Task[] = []
  // total 0 = size not known yet; hold the counter until every size is known so it can't race ahead
  const update = () => {
    if (tasks.some(t => !t.total)) return
    const total = tasks.reduce((s, t) => s + t.total, 0)
    const done = tasks.reduce((s, t) => s + t.done, 0)
    const pct = tasks.every(t => t.done >= t.total) ? 100 : Math.min(99, Math.floor((done / total) * 100))
    progress.value = Math.max(progress.value, pct)
  }
  const finish = (t: Task) => { t.total ||= 1; t.done = t.total; update() }

  for (const font of FONTS) {
    const t: Task = { total: FONT_WEIGHT, done: 0 }
    tasks.push(t)
    document.fonts.load(font).catch(err => console.warn('Font failed to load', font, err)).finally(() => finish(t))
  }

  // Streams a file and counts its bytes. `last` (0–1) holds back part of the task for work after the download.
  const fetchFile = (url: string, last = 0) => {
    const t: Task = { total: 0, done: 0 }
    tasks.push(t)
    const run = async () => {
      const res = await fetch(url)
      if (!res.ok || !res.body) throw new Error(`${res.status} ${url}`)
      const size = Number(res.headers.get('content-length')) || 0
      t.total = size || 1 // no length header: the file only counts once it's done
      update()
      const reader = res.body.getReader()
      const chunks: Uint8Array[] = []
      let received = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        received += value.length
        if (size) { t.done = Math.min(received, size) * (1 - last); update() }
      }
      return { blob: new Blob(chunks, { type: res.headers.get('content-type') ?? '' }), task: t }
    }
    return run().catch((err) => {
      console.warn('Asset failed to load', url, err)
      finish(t)
      return null
    })
  }

  for (const url of [FIRST_PROJECT.image]) {
    fetchFile(url).then((file) => {
      if (!file) return
      objectUrls[url] = URL.createObjectURL(file.blob)
      finish(file.task)
    })
  }

  // Decoding the stems is the last 10% of each stem's share
  const { addStem } = useSound()
  for (const [id, stem] of Object.entries(stems.stemsConfig)) {
    fetchFile(encodeURI(`/${stem.file}`), 0.1).then(async (file) => {
      if (!file) return
      try {
        await addStem(id, await file.blob.arrayBuffer())
      }
      catch (err) {
        console.warn('Stem failed to decode', id, err)
      }
      finish(file.task)
    })
  }

  update()
}

export function useLoader() {
  return { progress: readonly(progress), ready, objectUrls, startLoading }
}
