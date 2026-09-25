/**
 * CH-03 stems console — Web Audio graph for the 5 Silver Linings stems.
 * Ported from legacy/index.html's initAudio()/focusTrack()/toggleMute()/
 * telemetryMixerLoop(), kept close to the original per-stem DSP structure
 * (filter+distortion on drums/bass, filter+shine+wander+reverb-send on
 * melody, reverb+delay sends on atmos, flanger+ring-mod "cyber voice" on
 * vocals) so the sound stays the same; only the DOM wiring changed (no
 * innerHTML rebuild — every FX panel already exists, this just toggles
 * `hidden` and live parameter values).
 *
 * The AudioContext is created lazily on the first play() gesture only —
 * nothing here touches Web Audio before that.
 */
import type { HomeContent } from '../../content';
import { fxDisplay } from './fx-format';

// Only the stems config crosses to the client: StemsConsole.astro serialises
// home.stems.{stemsConfig,trackParams} into [data-stems] (never the whole
// home.json module).
type StemsData = Pick<HomeContent['stems'], 'stemsConfig' | 'trackParams'>;

type TrackKey = string;

interface StemNodes {
  audio: HTMLAudioElement;
  source: MediaElementAudioSourceNode;
  gain: GainNode;
  analyser: AnalyserNode;
  filter?: BiquadFilterNode;
  distortion?: WaveShaperNode;
  shine?: BiquadFilterNode;
  wanderPanner?: StereoPannerNode;
  wanderGain?: GainNode;
  reverbDelay?: DelayNode;
  reverbFeedback?: GainNode;
  reverbWet?: GainNode;
  delayNode?: DelayNode;
  delayFeedback?: GainNode;
  flangerDelay?: DelayNode;
  flangerGain?: GainNode;
  cyberDry?: GainNode;
  cyberWet?: GainNode;
  carrierOsc?: OscillatorNode;
}

function makeDistortionCurve(amount: number): Float32Array {
  const k = amount;
  const nSamples = 44100;
  const curve = new Float32Array(nSamples);
  const deg = Math.PI / 180;
  for (let i = 0; i < nSamples; ++i) {
    const x = (i * 2) / nSamples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export function initStemsConsole(): void {
  const rootEl = document.querySelector<HTMLElement>('[data-stems-console]');
  if (!rootEl) return;
  // Annotated (not just narrowed) so every nested function below sees a
  // plain HTMLElement — TS does not carry `if (!x) return` narrowing across
  // a closure boundary, only the variable's declared type.
  const root: HTMLElement = rootEl;
  const data: StemsData = JSON.parse(root.dataset.stems ?? '{}');
  if (!data.stemsConfig || !data.trackParams) return;
  const TRACK_KEYS = Object.keys(data.stemsConfig);
  const STEMS_CONFIG = data.stemsConfig;

  const playBtn = root.querySelector<HTMLButtonElement>('#av-play-btn')!;
  const playIcon = root.querySelector<HTMLElement>('[data-icon-play]')!;
  const pauseIcon = root.querySelector<HTMLElement>('[data-icon-pause]')!;
  const masterVol = root.querySelector<HTMLInputElement>('#master-vol')!;
  const fxTitle = root.querySelector<HTMLElement>('[data-fx-title]')!;

  // trackParams holds live mutable state; seeded from home.stems.trackParams (via [data-stems])
  // (itself a straight read of the legacy STEMS_CONFIG/trackParams data).
  type TrackParams = Record<string, Record<string, number | boolean>>;
  const trackParams: TrackParams = JSON.parse(JSON.stringify(data.trackParams));

  function num(key: TrackKey, id: string): number {
    return Number(trackParams[key][id]);
  }
  function isMuted(key: TrackKey): boolean {
    return Boolean(trackParams[key].muted);
  }
  function setMuted(key: TrackKey, val: boolean): void {
    trackParams[key].muted = val;
  }

  let audioCtx: AudioContext | null = null;
  let masterGainNode: GainNode | null = null;
  let masterAnalyser: AnalyserNode | null = null;
  const stems: Partial<Record<TrackKey, StemNodes>> = {};
  let isPlaying = false;
  let sidechainDucking = 1;
  let animFrame = 0;

  function getTrackNum(key: string): number {
    return TRACK_KEYS.indexOf(key) + 1;
  }

  function buildStem(ctx: AudioContext, master: GainNode, key: TrackKey): StemNodes {
    const config = STEMS_CONFIG[key];

    const audio = new Audio();
    audio.src = '/' + config.file;
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';

    const source = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();
    gain.gain.value = 1;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;

    if (key === 'drums' || key === 'bass') {
      const filterHz = num(key, 'filter');
      const filter = ctx.createBiquadFilter();
      filter.type = filterHz >= 3900 ? 'allpass' : 'lowpass';
      filter.frequency.value = filterHz;

      const distortion = ctx.createWaveShaper();
      distortion.curve = null;
      distortion.oversample = '4x';

      source.connect(filter);
      filter.connect(distortion);
      distortion.connect(gain);
      gain.connect(analyser);
      analyser.connect(master);

      return { audio, source, gain, analyser, filter, distortion };
    }

    if (key === 'melody') {
      const filterHz = num(key, 'filter');
      const filter = ctx.createBiquadFilter();
      filter.type = filterHz >= 3900 ? 'allpass' : 'lowpass';
      filter.frequency.value = filterHz;

      const shine = ctx.createBiquadFilter();
      shine.type = 'highshelf';
      shine.frequency.value = 3000;
      shine.gain.value = num(key, 'shine');

      const wanderPanner = ctx.createStereoPanner();
      const wanderLfo = ctx.createOscillator();
      wanderLfo.frequency.value = 0.8;
      const wanderGain = ctx.createGain();
      wanderGain.gain.value = num(key, 'wander') / 100;
      wanderLfo.connect(wanderGain);
      wanderGain.connect(wanderPanner.pan);
      wanderLfo.start();

      const reverbDelay = ctx.createDelay(0.5);
      reverbDelay.delayTime.value = 0.085;
      const reverbFeedback = ctx.createGain();
      reverbFeedback.gain.value = 0.55;
      const reverbWet = ctx.createGain();
      reverbWet.gain.value = (num(key, 'reverb') / 100) * 0.45;

      source.connect(filter);
      filter.connect(shine);
      shine.connect(wanderPanner);
      wanderPanner.connect(gain);
      wanderPanner.connect(reverbWet);
      reverbWet.connect(reverbDelay);
      reverbDelay.connect(reverbFeedback);
      reverbFeedback.connect(reverbDelay);
      reverbDelay.connect(gain);
      gain.connect(analyser);
      analyser.connect(master);

      return { audio, source, gain, analyser, filter, shine, wanderPanner, wanderGain, reverbDelay, reverbFeedback, reverbWet };
    }

    if (key === 'atmos') {
      const reverbDelay = ctx.createDelay(0.5);
      reverbDelay.delayTime.value = 0.12;
      const reverbFeedback = ctx.createGain();
      reverbFeedback.gain.value = 0.6;
      const reverbWet = ctx.createGain();
      reverbWet.gain.value = (num(key, 'reverb') / 100) * 0.45;

      const delayNode = ctx.createDelay(1.0);
      delayNode.delayTime.value = 0.375;
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.value = (num(key, 'delay') / 100) * 0.75;

      source.connect(gain);
      source.connect(reverbWet);
      reverbWet.connect(reverbDelay);
      reverbDelay.connect(reverbFeedback);
      reverbFeedback.connect(reverbDelay);
      reverbDelay.connect(gain);
      source.connect(delayNode);
      delayNode.connect(delayFeedback);
      delayFeedback.connect(delayNode);
      delayNode.connect(gain);
      gain.connect(analyser);
      analyser.connect(master);

      return { audio, source, gain, analyser, reverbDelay, reverbFeedback, reverbWet, delayNode, delayFeedback };
    }

    // vocals
    const flangerDelay = ctx.createDelay(0.1);
    flangerDelay.delayTime.value = 0.005;
    const flangerLfo = ctx.createOscillator();
    flangerLfo.frequency.value = 0.35;
    const flangerGain = ctx.createGain();
    flangerGain.gain.value = (num(key, 'flanger') / 100) * 0.004;
    flangerLfo.connect(flangerGain);
    flangerGain.connect(flangerDelay.delayTime);
    flangerLfo.start();
    source.connect(flangerDelay);

    const cyberVal = num(key, 'cyber');
    const cyberDry = ctx.createGain();
    const cyberWet = ctx.createGain();
    const cyberWetBlend = cyberVal > 0 ? 0.8 : 0;
    cyberDry.gain.value = 1 - cyberWetBlend;
    cyberWet.gain.value = cyberWetBlend;

    const ringMod = ctx.createGain();
    ringMod.gain.value = 0;
    const carrierOsc = ctx.createOscillator();
    carrierOsc.type = 'sine';
    carrierOsc.frequency.value = 70 + cyberVal * 2.8;
    carrierOsc.connect(ringMod.gain);
    carrierOsc.start();

    flangerDelay.connect(cyberDry);
    flangerDelay.connect(cyberWet);
    cyberWet.connect(ringMod);
    cyberDry.connect(gain);
    ringMod.connect(gain);
    gain.connect(analyser);
    analyser.connect(master);

    return { audio, source, gain, analyser, flangerDelay, flangerGain, cyberDry, cyberWet, carrierOsc };
  }

  function initAudio(): void {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioCtx = ctx;
    masterGainNode = ctx.createGain();
    masterGainNode.gain.value = parseFloat(masterVol.value);
    masterAnalyser = ctx.createAnalyser();
    masterAnalyser.fftSize = 1024;
    masterGainNode.connect(masterAnalyser);
    masterAnalyser.connect(ctx.destination);

    TRACK_KEYS.forEach((key) => {
      stems[key] = buildStem(ctx, masterGainNode!, key);
    });
  }

  function updateNodeValue(trackKey: TrackKey, paramId: string, val: number): void {
    const stem = stems[trackKey];
    if (!stem || !audioCtx) return;
    const time = audioCtx.currentTime;

    if (paramId === 'filter' && stem.filter) {
      if (val >= 3900) {
        stem.filter.type = 'allpass';
      } else {
        stem.filter.type = 'lowpass';
        stem.filter.frequency.setValueAtTime(val, time);
      }
    } else if (paramId === 'dist' && stem.distortion) {
      stem.distortion.curve = val === 0 ? null : (makeDistortionCurve(val * 10) as Float32Array<ArrayBuffer>);
    } else if (paramId === 'shine' && stem.shine) {
      stem.shine.gain.setValueAtTime(val, time);
    } else if (paramId === 'reverb' && stem.reverbWet) {
      stem.reverbWet.gain.setValueAtTime((val / 100) * 0.45, time);
    } else if (paramId === 'wander' && stem.wanderGain) {
      stem.wanderGain.gain.setValueAtTime(val / 100, time);
    } else if (paramId === 'delay' && stem.delayFeedback) {
      stem.delayFeedback.gain.setValueAtTime((val / 100) * 0.75, time);
    } else if (paramId === 'flanger' && stem.flangerGain) {
      stem.flangerGain.gain.setValueAtTime((val / 100) * 0.004, time);
    } else if (paramId === 'cyber' && stem.cyberDry && stem.cyberWet && stem.carrierOsc) {
      if (val === 0) {
        stem.cyberDry.gain.setValueAtTime(1, time);
        stem.cyberWet.gain.setValueAtTime(0, time);
      } else {
        const wetBlend = 0.8;
        stem.cyberDry.gain.setValueAtTime(1 - wetBlend, time);
        stem.cyberWet.gain.setValueAtTime(wetBlend, time);
        stem.carrierOsc.frequency.setValueAtTime(70 + val * 2.8, time);
      }
    }
  }

  function focusTrack(trackKey: TrackKey): void {
    root.querySelectorAll<HTMLButtonElement>('[data-track-select]').forEach((btn) => {
      const isSelected = btn.dataset.trackSelect === trackKey;
      btn.setAttribute('aria-pressed', String(isSelected));
    });

    root.querySelectorAll<HTMLElement>('[data-fx-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.fxPanel !== trackKey;
    });

    fxTitle.textContent = `0${getTrackNum(trackKey)}. ${STEMS_CONFIG[trackKey].name} FX`;
  }

  function toggleMute(trackKey: TrackKey): void {
    const next = !isMuted(trackKey);
    setMuted(trackKey, next);

    // Visible label stays constant; aria-pressed carries the state.
    const muteBtn = root.querySelector<HTMLButtonElement>(`#mute-${trackKey}`)!;
    muteBtn.setAttribute('aria-pressed', String(next));
  }

  // Cached once: meter elements and one analyser buffer per stem, so the
  // rAF loop allocates nothing and queries nothing.
  const meters: Record<string, { bar: HTMLElement; fill: HTMLElement } | undefined> = {};
  TRACK_KEYS.forEach((key) => {
    const bar = root.querySelector<HTMLElement>(`[data-meter="${key}"]`);
    const fill = bar?.querySelector<HTMLElement>('[data-meter-fill]');
    if (bar && fill) meters[key] = { bar, fill };
  });
  const freqData: Record<string, Uint8Array<ArrayBuffer>> = {};
  const IDLE_SCALE = 0.12;

  // Compositor-only meter: transform scaleY for level, opacity for intensity.
  function setMeter(key: string, level: number | null): void {
    const m = meters[key];
    if (!m) return;
    if (level === null) {
      m.bar.style.transform = '';
      m.fill.style.opacity = '';
      return;
    }
    m.bar.style.transform = `scaleY(${Math.max(IDLE_SCALE, level)})`;
    m.fill.style.opacity = String(Math.min(1, level * 1.1));
  }

  function bins(key: string, analyser: AnalyserNode): Uint8Array<ArrayBuffer> {
    let buf = freqData[key];
    if (!buf || buf.length !== analyser.frequencyBinCount) {
      buf = new Uint8Array(analyser.frequencyBinCount);
      freqData[key] = buf;
    }
    return buf;
  }

  function meterLoop(): void {
    if (!isPlaying || !audioCtx) return;

    let kickEnergy = 0;
    const drums = stems.drums;
    if (drums && !isMuted('drums')) {
      const d = bins('drums', drums.analyser);
      drums.analyser.getByteFrequencyData(d);
      kickEnergy = (d[0] + d[1] + d[2] + d[3]) / 4;
    }
    const baseDuck = 1 - Math.min(0.65, (kickEnergy / 255) * 0.95);
    sidechainDucking = sidechainDucking * 0.75 + baseDuck * 0.25;

    TRACK_KEYS.forEach((key) => {
      const stem = stems[key];
      if (!stem) return;
      const muted = isMuted(key);

      if (muted) {
        setMeter(key, null);
      } else {
        const d = bins(key, stem.analyser);
        stem.analyser.getByteFrequencyData(d);
        let sum = 0;
        for (let i = 0; i < d.length; i++) sum += d[i];
        const avg = sum / d.length;
        setMeter(key, Math.min(1, avg / 120));
      }

      if (muted) {
        stem.gain.gain.setValueAtTime(0, audioCtx!.currentTime);
      } else {
        const dist = num(key, 'dist');
        let compFactor = 1;
        if ((key === 'drums' || key === 'bass') && dist > 0) {
          compFactor = 1 / (1 + dist * 0.045);
        }
        let targetVol = compFactor;
        if (key !== 'drums') targetVol *= sidechainDucking;
        stem.gain.gain.setValueAtTime(targetVol, audioCtx!.currentTime);
      }
    });

    animFrame = requestAnimationFrame(meterLoop);
  }

  function startPlayback(): void {
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = '';
    playBtn.setAttribute('aria-pressed', 'true');

    if (audioCtx?.state === 'suspended') void audioCtx.resume();
    Object.values(stems).forEach((stem) => void stem?.audio.play().catch(() => {}));

    meterLoop();
  }

  function stopPlayback(): void {
    isPlaying = false;
    playIcon.style.display = '';
    pauseIcon.style.display = 'none';
    playBtn.setAttribute('aria-pressed', 'false');
    cancelAnimationFrame(animFrame);
    if (audioCtx?.state === 'running') void audioCtx.suspend();

    Object.entries(stems).forEach(([key, stem]) => {
      stem?.audio.pause();
      if (stem) stem.audio.currentTime = 0;
      setMeter(key, null);
    });
  }

  // ---- wiring ----
  root.querySelectorAll<HTMLButtonElement>('[data-track-select]').forEach((btn) => {
    btn.addEventListener('click', () => focusTrack(btn.dataset.trackSelect as TrackKey));
  });

  root.querySelectorAll<HTMLButtonElement>('[data-track-mute]').forEach((btn) => {
    btn.addEventListener('click', () => toggleMute(btn.dataset.trackMute as TrackKey));
  });

  root.querySelectorAll<HTMLInputElement>('.fx-slider').forEach((input) => {
    input.addEventListener('input', () => {
      const trackKey = input.dataset.track as TrackKey;
      const paramId = input.dataset.param!;
      const val = parseFloat(input.value);
      trackParams[trackKey][paramId] = val;

      const out = root.querySelector<HTMLOutputElement>(`#label-${trackKey}-${paramId}`);
      const shown = fxDisplay(paramId, val);
      if (out) out.textContent = shown;
      input.setAttribute('aria-valuetext', shown);

      updateNodeValue(trackKey, paramId, val);
    });
  });

  masterVol.addEventListener('input', () => {
    if (masterGainNode && audioCtx) {
      masterGainNode.gain.setValueAtTime(parseFloat(masterVol.value), audioCtx.currentTime);
    }
  });

  playBtn.addEventListener('click', () => {
    if (!audioCtx) initAudio();
    if (isPlaying) stopPlayback();
    else startPlayback();
  });

  window.addEventListener('pagehide', () => cancelAnimationFrame(animFrame));
}
