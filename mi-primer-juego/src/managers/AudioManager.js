/**
 * Administrador de audio procedural para el juego utilizando Web Audio API nativo.
 * No depende de archivos externos ni genera errores de carga 404.
 * Cumple con SRP administrando síntesis de efectos de sonido, transiciones ambientales
 * y paisajes sonoros dinámicos.
 */
export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.ctx = null;
    this.ambientNodes = [];
    this.caveDripTimer = null;
    this.campfireTimer = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // ==========================================
  // SONIDOS CINEMÁTICOS PARA ESCENA 1 (HITO 1)
  // ==========================================

  playStormAmbient() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopAmbient();

    // 1. Generador de ruido para viento y mar embravecido
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filtro paso bajo para crear el sonido sordo de la tormenta
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(260, ctx.currentTime);

    // Ganancia con modulación suave (ráfagas)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 1.5);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start();

    this.ambientGain = gainNode;
    this.ambientNodes.push(whiteNoise, filter, gainNode);
  }

  playThunder() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(140, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  playBladeExtraction() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Desenvaine metálico agudo y resonante
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.45);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  playHopeEnergySurge() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Acorde ascendente celestial brillante (La Esperanza liberándose)
    const frequencies = [220, 277.18, 329.63, 440, 659.25, 880];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.01, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + 3.3);
    });
  }

  playCaveAmbient() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopAmbient();

    // 1. Tono sutil de reverberación de cueva
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(65, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    this.ambientNodes.push(osc, gain);

    // 2. Crepitar periódico de fogata
    this.campfireTimer = this.scene.time.addEvent({
      delay: 220,
      loop: true,
      callback: () => {
        if (Math.random() < 0.65) this.playCampfireCrackle();
      }
    });

    // 3. Gotas de agua cayendo en la roca
    this.caveDripTimer = this.scene.time.addEvent({
      delay: 1800,
      loop: true,
      callback: () => {
        this.playWaterDrip();
      }
    });
  }

  playCampfireCrackle() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800 + Math.random() * 1200, ctx.currentTime);

    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playWaterDrip() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const baseFreq = 950 + Math.random() * 300;

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  fadeAmbient(durationMs = 1500) {
    if (this.ambientGain && this.ctx) {
      const durationSec = durationMs / 1000;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + durationSec);
      this.scene.time.delayedCall(durationMs, () => this.stopAmbient());
    } else {
      this.stopAmbient();
    }
  }

  stopAmbient() {
    if (this.caveDripTimer) {
      this.caveDripTimer.remove();
      this.caveDripTimer = null;
    }
    if (this.campfireTimer) {
      this.campfireTimer.remove();
      this.campfireTimer = null;
    }
    this.ambientNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Ignorar si el nodo ya fue detenido
      }
    });
    this.ambientNodes = [];
    this.ambientGain = null;
  }

  // ==========================================
  // SONIDOS DE COMBATE Y JUEGO
  // ==========================================

  playAttack() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.19);
  }

  playExplosion() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.42);
  }

  playEnemyDeath() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.23);
  }

  playBoss() {
    this.playThunder();
  }
}
