/**
 * Administrador de audio procedural utilizando Web Audio API nativo.
 * No depende de archivos externos ni genera errores de carga 404.
 * Cumple con SRP administrando síntesis de efectos sonoros, paisajes acústicos
 * de Esparta (lira, brisa, tambores de guerra, cuernos) y audio de combate.
 */
export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.ctx = null;
    this.ambientNodes = [];
    this.activeTimers = [];
    this.ambientGain = null;

    if (scene?.events) {
      scene.events.once("shutdown", () => this.stopAmbient());
      scene.events.once("destroy", () => this.stopAmbient());
    }
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // ==========================================================================
  // PAISAJES SONOROS Y EFECTOS DE PARTE 1: EL PRECIO DE LA GLORIA
  // ==========================================================================

  /**
   * Música acústica suave (lira griega / kithara en modo dórico) + brisa cálida
   * para el Hito 1.1 (La Paz Antes de la Tormenta).
   */
  playPeacefulVillageAmbient() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopAmbient();

    // 1. Brisa suave de fondo (ruido filtrado cálido)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const breeze = ctx.createBufferSource();
    breeze.buffer = noiseBuffer;
    breeze.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(340, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.005, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 1.5);

    breeze.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    breeze.start();

    this.ambientGain = masterGain;
    this.ambientNodes.push(breeze, filter, masterGain);

    // 2. Arpegio acústico suave de lira espartana (escala dórica en Re)
    const dorianNotes = [293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 440.0];
    let step = 0;
    const lyreTimer = this.scene.time.addEvent({
      delay: 750,
      loop: true,
      callback: () => {
        const note = dorianNotes[(step + (step % 3 === 0 ? 2 : 0)) % dorianNotes.length];
        this.playLyrePluck(note);
        step++;
      }
    });
    this.activeTimers.push(lyreTimer);

    // 3. Trino lejano ocasional de aves del valle
    const birdTimer = this.scene.time.addEvent({
      delay: 3800,
      loop: true,
      callback: () => {
        if (Math.random() < 0.6) this.playBirdChirp();
      }
    });
    this.activeTimers.push(birdTimer);
  }

  playLyrePluck(freq) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    harmonic.type = "sine";
    harmonic.frequency.setValueAtTime(freq * 2, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc.connect(gain);
    harmonic.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    harmonic.start();
    osc.stop(ctx.currentTime + 1.25);
    harmonic.stop(ctx.currentTime + 1.25);
  }

  playBirdChirp() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startFreq = 1850 + Math.random() * 500;
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.35, ctx.currentTime + 0.07);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.9, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  }

  /** Sonido metálico y de madera al recibir el Hoplón y la Dory */
  playEquipGear() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Clank de bronce del escudo
    const shieldOsc = ctx.createOscillator();
    const shieldGain = ctx.createGain();
    shieldOsc.type = "triangle";
    shieldOsc.frequency.setValueAtTime(520, ctx.currentTime);
    shieldOsc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.25);
    shieldGain.gain.setValueAtTime(0.14, ctx.currentTime);
    shieldGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    shieldOsc.connect(shieldGain);
    shieldGain.connect(ctx.destination);
    shieldOsc.start();
    shieldOsc.stop(ctx.currentTime + 0.32);

    // Golpe seco del astil de la lanza
    const woodOsc = ctx.createOscillator();
    const woodGain = ctx.createGain();
    woodOsc.type = "sine";
    woodOsc.frequency.setValueAtTime(160, ctx.currentTime + 0.12);
    woodOsc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.24);
    woodGain.gain.setValueAtTime(0.16, ctx.currentTime + 0.12);
    woodGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    woodOsc.connect(woodGain);
    woodGain.connect(ctx.destination);
    woodOsc.start(ctx.currentTime + 0.12);
    woodOsc.stop(ctx.currentTime + 0.3);
  }

  /** Pop discreto al aparecer una viñeta o bocadillo de cómic */
  playComicPop() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(340, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(510, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  /** Cascos de caballo del explorador irrumpiendo en la plaza */
  playHorseGallop(beats = 6) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    for (let i = 0; i < beats; i++) {
      const delay = i * 0.16 + (i % 2 === 1 ? 0.04 : 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(125 - i * 4, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + delay + 0.09);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.11);
    }
  }

  /** Caída del explorador herido sobre el empedrado */
  playMessengerFall() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(36, ctx.currentTime + 0.24);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  /** Cuerno de guerra espartano al llamado "¡A las armas!" */
  playWarHorn() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const freqs = [110, 164.81, 220];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f * 0.94, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(f, ctx.currentTime + 0.35);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(620, ctx.currentTime);

      gain.gain.setValueAtTime(0.005, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(idx === 0 ? 0.14 : 0.07, ctx.currentTime + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.9);
    });
  }

  /** Golpe del soldado contra su pecho / escudo */
  playChestPound() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(185, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(52, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.24, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  }

  /** Tambores de guerra para la marcha hacia la batalla y cierre de Escena 1 */
  playWarDrums(beats = 6) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    for (let i = 0; i < beats; i++) {
      const t = ctx.currentTime + i * 0.45;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(98, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.26);

      gain.gain.setValueAtTime(0.26, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    }
  }

  fadeAmbient(durationMs = 1200) {
    this.clearTimers();
    if (this.ambientGain && this.ctx) {
      const durationSec = durationMs / 1000;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + durationSec);
      this.scene.time.delayedCall(durationMs, () => this.stopAmbient());
    } else {
      this.stopAmbient();
    }
  }

  clearTimers() {
    this.activeTimers.forEach((timer) => {
      try {
        timer.remove();
      } catch (e) {
        // Timer ya removido
      }
    });
    this.activeTimers = [];
  }

  stopAmbient() {
    this.clearTimers();
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

  // ==========================================================================
  // SONIDOS DE COMBATE Y JUEGO (MODO COMBATE LIBRE Y FUTURAS ESCENAS)
  // ==========================================================================

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
