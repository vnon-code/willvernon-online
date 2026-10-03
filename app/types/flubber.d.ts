// Minimal types for flubber 0.4.2 (no bundled types): only what the Gate uses.
declare module 'flubber' {
  type Ring = [number, number][]
  export function combine(
    from: (Ring | string)[],
    to: Ring | string,
    options: { single: true, maxSegmentLength?: number },
  ): (t: number) => string
}
