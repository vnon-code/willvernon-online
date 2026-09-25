/**
 * The one signature WebGL moment: an OGL "scope field" of thin horizontal
 * oscilloscope traces. Idle mode is seeded from the real Silver Linings
 * stem envelope (src/data/scope-envelope.json) and bows toward the cursor;
 * audio mode (Phase 5, via attachAnalyser()) drives the same traces from a
 * live AnalyserNode instead.
 *
 * This module is meant to be loaded as a lazy dynamic import — see
 * src/components/SignalScope.astro for the intersection + idle-callback
 * gating that decides *when* to import it. Everything in here assumes a
 * WebGL context is about to be created right away.
 *
 * Imports only what's used from 'ogl': Renderer, Program, Mesh, Geometry,
 * Transform. No Polyline/Camera/scene-graph extras — traces are drawn
 * directly in clip space (no camera needed), one shared Program, one draw
 * call per trace.
 */
import { Renderer, Program, Mesh, Geometry, Transform } from 'ogl';
import envelopeData from '../data/scope-envelope.json';

export type ScopeMode = 'idle' | 'audio';

export interface ScopeOptions {
  mode?: ScopeMode;
  traces?: number; // desired trace count on wide viewports (6-9)
  class?: string;
}

export interface ScopeController {
  attachAnalyser(node: AnalyserNode): void;
  /** Back to idle mode; stops the analyser pull loop. */
  detachAnalyser(): void;
  destroy(): void;
}

type Stem = { name: string; file: string; duration: number; envelope: number[] };
type Envelope = { track: string; generatedAt: string; points: number; stems: Stem[] };

const envelope = envelopeData as Envelope;

const SEGMENTS = 96; // vertices per trace line
const DPR_CAP = 1.5;
const MOBILE_BREAKPOINT = 768;
const MOBILE_TRACE_COUNT = 3;
const CURSOR_RADIUS_PX = 120;

const VERT = /* glsl */ `
  attribute vec2 position;
  attribute float aProgress;
  varying float vProgress;
  void main() {
    vProgress = aProgress;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform int uStyle; // 0 solid, 1 dashed, 2 dotted
  varying float vProgress;
  void main() {
    float visible = 1.0;
    if (uStyle == 1) {
      visible = step(0.5, fract(vProgress * 40.0));
    } else if (uStyle == 2) {
      visible = step(0.72, fract(vProgress * 90.0));
    }
    if (visible < 0.5) discard;
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.trim().replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16);
  return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
}

function readToken(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

interface TraceConfig {
  stem: Stem;
  baseline: number; // NDC y, -1..1
  amplitude: number; // NDC units
  phase: number;
  speed: number;
  color: [number, number, number];
  accentColor: [number, number, number];
  style: 0 | 1 | 2;
}

export function initScope(canvas: HTMLCanvasElement, opts: ScopeOptions = {}): ScopeController {
  const host = canvas.parentElement;
  const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

  const renderer = new Renderer({ canvas, alpha: true, antialias: true, dpr: Math.min(DPR_CAP, window.devicePixelRatio || 1) });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const scene = new Transform();
  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const textColor = hexToRgb01(readToken('--text', '#ededed'));
  const mutedColor = hexToRgb01(readToken('--text-muted', '#7d838a'));
  const accentColor = hexToRgb01(readToken('--accent', '#ff3b30'));
  const accent2Color = hexToRgb01(readToken('--accent-2', '#ffb000'));

  const palette: [number, number, number][] = [textColor, accent2Color, mutedColor, textColor, mutedColor];
  const styles: (0 | 1 | 2)[] = [0, 0, 1, 2, 1];

  let mode: ScopeMode = opts.mode === 'audio' ? 'audio' : 'idle';
  let analyser: AnalyserNode | null = null;
  let analyserData: Uint8Array<ArrayBuffer> | null = null;

  let traces: TraceConfig[] = [];
  let meshes: Mesh[] = [];
  let progressAttr = new Float32Array(SEGMENTS);
  for (let i = 0; i < SEGMENTS; i++) progressAttr[i] = i / (SEGMENTS - 1);

  function disposeMeshes() {
    meshes.forEach((m) => {
      scene.removeChild(m);
      Object.values(m.geometry.attributes).forEach((attr: any) => {
        if (attr.buffer) gl.deleteBuffer(attr.buffer);
      });
    });
  }

  function buildTraces() {
    disposeMeshes();
    meshes = [];

    const count = isMobile() ? MOBILE_TRACE_COUNT : Math.max(6, Math.min(9, opts.traces || 7));
    const mobile = isMobile();
    const stems = envelope.stems;

    traces = Array.from({ length: count }, (_, i) => {
      const stem = stems[i % stems.length];
      // Baseline spread across the canvas height. Mobile: confined to the
      // top third (protects LCP/CLS on the hero) -> NDC y in [0.33, 0.95].
      const t = count === 1 ? 0.5 : i / (count - 1);
      const baseline = mobile ? 0.95 - t * (0.95 - 0.33) : 0.82 - t * 1.64;
      return {
        stem,
        baseline,
        amplitude: mobile ? 0.035 : 0.06 + (i % 3) * 0.015,
        phase: i * 1.37,
        speed: 0.15 + (i % 4) * 0.04,
        color: palette[i % palette.length],
        accentColor,
        style: styles[i % styles.length],
      } as TraceConfig;
    });

    meshes = traces.map((trace) => {
      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array(SEGMENTS * 2), usage: gl.DYNAMIC_DRAW },
        aProgress: { size: 1, data: progressAttr },
      });
      const mesh = new Mesh(gl, { geometry, program, mode: gl.LINE_STRIP });
      mesh.onBeforeRender(() => {
        program.uniforms.uColor = { value: trace.color };
        program.uniforms.uOpacity = { value: 0.85 };
        program.uniforms.uStyle = { value: trace.style };
      });
      mesh.setParent(scene);
      return mesh;
    });
  }

  buildTraces();

  let pointerNdc = { x: -2, y: -2 }; // off-canvas by default
  function onPointerMove(e: PointerEvent) {
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerNdc = { x, y };
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  const idleSample = (stemEnvelope: number[], u: number) => {
    const idx = u * (stemEnvelope.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(stemEnvelope.length - 1, i0 + 1);
    const frac = idx - i0;
    return stemEnvelope[i0] * (1 - frac) + stemEnvelope[i1] * frac;
  };

  let running = false;
  let raf = 0;
  let frameCount = 0;
  let startedAt = performance.now();

  function updateTrace(trace: TraceConfig, mesh: Mesh, timeSec: number, radiusNdcX: number) {
    const pos = mesh.geometry.attributes.position.data as Float32Array;

    for (let i = 0; i < SEGMENTS; i++) {
      const u = i / (SEGMENTS - 1);
      const x = u * 2 - 1;

      let y: number;
      if (mode === 'audio' && analyser && analyserData) {
        const bin = Math.floor(u * (analyserData.length - 1));
        const v = (analyserData[bin] - 128) / 128; // -1..1
        y = trace.baseline + v * trace.amplitude * 1.4;
      } else {
        const envVal = idleSample(trace.stem.envelope, u); // 0..1
        const wave = Math.sin(u * Math.PI * 6 + timeSec * trace.speed * 4 + trace.phase);
        y = trace.baseline + (envVal - 0.5) * trace.amplitude * 1.2 + wave * trace.amplitude * 0.25 * envVal;
      }

      // Bow toward the cursor within ~120px, idle mode only.
      if (mode === 'idle') {
        const dx = x - pointerNdc.x;
        if (Math.abs(dx) < radiusNdcX) {
          const falloff = 1 - Math.abs(dx) / radiusNdcX;
          const bow = falloff * falloff * 0.08 * Math.sign(pointerNdc.y - y || 1);
          y += bow;
        }
      }

      pos[i * 2] = x;
      pos[i * 2 + 1] = y;
    }
    mesh.geometry.attributes.position.needsUpdate = true;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!running) return;

    // Mobile perf cap: render every other rAF (~30fps).
    frameCount++;
    if (isMobile() && frameCount % 2 !== 0) return;

    const timeSec = (now - startedAt) / 1000;
    const radiusNdcX = host ? (CURSOR_RADIUS_PX / host.getBoundingClientRect().width) * 2 : 0.1;

    traces.forEach((trace, i) => updateTrace(trace, meshes[i], timeSec, radiusNdcX));

    renderer.render({ scene });
    host?.classList.add('is-running');
  }

  function resize() {
    if (!host) return;
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    buildTraces();
  }

  const ro = new ResizeObserver(() => resize());
  if (host) ro.observe(host);
  resize();

  function play() {
    if (running) return;
    running = true;
  }
  function pause() {
    running = false;
    host?.classList.remove('is-running');
  }

  raf = requestAnimationFrame(frame);
  play();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? play() : pause()));
    },
    { threshold: 0.05 },
  );
  if (host) io.observe(host);

  function onVisibility() {
    if (document.hidden) pause();
    else if (host && host.getBoundingClientRect().top < window.innerHeight && host.getBoundingClientRect().bottom > 0) play();
  }
  document.addEventListener('visibilitychange', onVisibility);

  function onContextLost(e: Event) {
    e.preventDefault();
    pause();
    host?.classList.remove('is-running');
    host?.classList.add('is-context-lost');
  }
  canvas.addEventListener('webglcontextlost', onContextLost);

  function destroy() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    disposeMeshes();
    host?.classList.remove('is-running');
  }

  return {
    attachAnalyser(node: AnalyserNode) {
      const wasAttached = analyser !== null;
      analyser = node;
      analyserData = new Uint8Array(analyser.frequencyBinCount);
      mode = 'audio';
      if (wasAttached) return; // pull loop already running
      const pullRaf = () => {
        if (!analyser || !analyserData) return; // detached: loop ends
        analyser.getByteTimeDomainData(analyserData);
        requestAnimationFrame(pullRaf);
      };
      pullRaf();
    },
    detachAnalyser() {
      analyser = null;
      analyserData = null;
      mode = 'idle';
    },
    destroy,
  };
}
