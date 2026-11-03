/**
 * Motor de Sonido Sintetizado con Web Audio API
 * Garantiza sonido profesional de cañonazos, campanas navales,
 * impactos, oleaje y fanfarrias sin depender de descargas externas.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.ambientNoiseNode = null;
    this.ambientFilter = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.startOceanAmbient();
    } catch (e) {
      console.warn("Web Audio API no soportada:", e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Generador de buffer de ruido blanco reutilizable
  createNoiseBuffer(seconds = 2) {
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Cañonazo Naval Histórico (Armstrong 300 lbs vs 40/70 lbs)
  playCannon(isHeavy = false) {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = isHeavy ? 2.5 : 1.8;

    // 1. Pulso sub-grave (explosión de pólvora negra)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    
    const startFreq = isHeavy ? 130 : 180;
    const endFreq = isHeavy ? 24 : 35;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + (isHeavy ? 0.35 : 0.25));

    oscGain.gain.setValueAtTime(isHeavy ? 1.4 : 0.9, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.8 : 0.5));

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration);

    // 2. Estallido de presión y humo (Ruido blanco filtrado pasabanda)
    const noiseBuffer = this.createNoiseBuffer(duration);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHeavy ? 450 : 750, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + duration);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isHeavy ? 1.6 : 1.0, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + duration);

    // 3. Crack inicial de detonación metálica
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'sawtooth';
    clickOsc.frequency.setValueAtTime(320, now);
    clickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    clickGain.gain.setValueAtTime(0.8, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.1);
  }

  // Impacto en Casco (Madera o Blindaje de Hierro)
  playImpact(isArmor = false) {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Impacto metálico / madera astillada
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isArmor ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isArmor ? 520 : 140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.7);

    // Crunch de madera / metralla
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.8);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isArmor ? 1200 : 600, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.8, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.8);
  }

  // Impacto en Agua (Géiser)
  playSplash() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(1.4);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 1.4);
  }

  // Campana de a bordo (Zafarrancho de Combate)
  playBell() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const freqs = [1180, 2360, 3540];
    const now = this.ctx.currentTime;

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      const vol = 0.35 / (i + 1);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.9);
    });
  }

  // Colisión Violenta (Espolonazo / Encallamiento en Punta Gruesa)
  playRamming() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Estruendo sordo
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(30, now + 1.2);

    gain.gain.setValueAtTime(1.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 2.3);

    // Crujido prolongado de planchas y quilla
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(2.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.Q.setValueAtTime(1.8, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(1.2, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 2.6);
  }

  // Fanfarria Victoriosa (Acordes Mayores Marciales)
  playVictory() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const notes = [
      { note: 261.63, time: 0.0, dur: 0.25 }, // C4
      { note: 329.63, time: 0.25, dur: 0.25 }, // E4
      { note: 392.00, time: 0.5, dur: 0.25 }, // G4
      { note: 523.25, time: 0.75, dur: 0.7 }, // C5
      { note: 392.00, time: 1.5, dur: 0.25 }, // G4
      { note: 523.25, time: 1.8, dur: 1.2 }   // C5 held
    ];

    const baseTime = this.ctx.currentTime + 0.1;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.note, baseTime + n.time);

      gain.gain.setValueAtTime(0, baseTime + n.time);
      gain.gain.linearRampToValueAtTime(0.3, baseTime + n.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, baseTime + n.time + n.dur);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, baseTime + n.time);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(baseTime + n.time);
      osc.stop(baseTime + n.time + n.dur + 0.1);
    });
  }

  // Toque Trágico Fúnebre (Game Over - Acorde Menor Lento)
  playGameOver() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const notes = [
      { note: 220.00, time: 0.0, dur: 0.6 }, // A3
      { note: 196.00, time: 0.6, dur: 0.6 }, // G3
      { note: 174.61, time: 1.2, dur: 0.8 }, // F3
      { note: 164.81, time: 2.0, dur: 2.0 }  // E3 (lamento solemne)
    ];

    const baseTime = this.ctx.currentTime + 0.1;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.note, baseTime + n.time);

      gain.gain.setValueAtTime(0, baseTime + n.time);
      gain.gain.linearRampToValueAtTime(0.4, baseTime + n.time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, baseTime + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(baseTime + n.time);
      osc.stop(baseTime + n.time + n.dur + 0.1);
    });

    // Redoble fúnebre sordo
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(3.0);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, baseTime);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.35, baseTime);
    nGain.gain.exponentialRampToValueAtTime(0.001, baseTime + 3.0);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(baseTime);
    noise.stop(baseTime + 3.1);
  }

  // Sonido ambiental de oleaje y viento de mar
  startOceanAmbient() {
    if (!this.ctx || this.ambientNoiseNode) return;
    try {
      const buffer = this.createNoiseBuffer(6.0);
      this.ambientNoiseNode = this.ctx.createBufferSource();
      this.ambientNoiseNode.buffer = buffer;
      this.ambientNoiseNode.loop = true;

      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(260, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.ambientNoiseNode.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      this.ambientNoiseNode.start(0);

      // Modular la frecuencia suavemente para simular olas
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // una ola cada 5.5 seg
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(90, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(this.ambientFilter.frequency);
      lfo.start(0);
    } catch (e) {
      console.warn("No se pudo iniciar ambiente sonoro:", e);
    }
  }
}

window.soundEngine = new SoundEngine();
