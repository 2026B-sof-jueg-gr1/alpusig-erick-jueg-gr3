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

  // ==========================================================================
  // SONIDOS DE ESCENA 2: EL BARRO, LA LANZA Y LA CAÍDA
  // ==========================================================================

  /** Lluvia intensa, viento del desfiladero y pulso heroico-tenso inicial */
  playBattleRainAmbient() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopAmbient();

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const rain = ctx.createBufferSource();
    rain.buffer = noiseBuffer;
    rain.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1150, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.6, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.01, ctx.currentTime);
    rainGain.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 1.2);

    rain.connect(bandpass);
    bandpass.connect(rainGain);
    rainGain.connect(ctx.destination);
    rain.start();

    this.ambientGain = rainGain;
    this.ambientNodes.push(rain, bandpass, rainGain);

    // Pulso marcial heroico sutil al comienzo de Hito 2.1
    const warPulseTimer = this.scene.time.addEvent({
      delay: 900,
      loop: true,
      callback: () => this.playWarDrums(1)
    });
    this.activeTimers.push(warPulseTimer);
  }

  /** Cambio de tono a música grave y disonante (Trigger 2: "¡nos tendieron una trampa!") */
  playDissonantBattleShift() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.clearTimers();

    // Dron grave disonante (tritono + semitono)
    [73.42, 103.83, 77.78].forEach((freq) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(240, ctx.currentTime);

      gain.gain.setValueAtTime(0.002, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 1.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      this.ambientNodes.push(osc, filter, gain);
    });
  }

  playSpearThrust(step = 1) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const startFreq = 320 + step * 55;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(95, ctx.currentTime + 0.13);
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  playHeavySweep() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(240, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.28);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  }

  playShieldBlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    [680, 990].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    });
  }

  playShieldBash() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  playBackstabImpact() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.42);
    gain.gain.setValueAtTime(0.32, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.48);
  }

  /** Sonido amortiguado de latidos y respiración ahogada (Hito 2.2 y 2.3) */
  playHeartbeatAndBreath(periodMs = 1100) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopAmbient();

    // Fondo sordo amortiguado
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(52, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    this.ambientGain = gain;
    this.ambientNodes.push(osc, gain);

    const beatOnce = () => {
      const c = this.ensureContext();
      if (!c) return;
      [0, 0.22].forEach((offset, idx) => {
        const bOsc = c.createOscillator();
        const bGain = c.createGain();
        bOsc.type = "sine";
        bOsc.frequency.setValueAtTime(idx === 0 ? 74 : 62, c.currentTime + offset);
        bOsc.frequency.exponentialRampToValueAtTime(34, c.currentTime + offset + 0.16);
        bGain.gain.setValueAtTime(idx === 0 ? 0.28 : 0.2, c.currentTime + offset);
        bGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + offset + 0.18);
        bOsc.connect(bGain);
        bGain.connect(c.destination);
        bOsc.start(c.currentTime + offset);
        bOsc.stop(c.currentTime + offset + 0.2);
      });
    };

    beatOnce();
    const heartTimer = this.scene.time.addEvent({
      delay: periodMs,
      loop: true,
      callback: beatOnce
    });
    this.activeTimers.push(heartTimer);
  }

  playGeneralImpale() {
    this.playBackstabImpact();
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Acorde trágico descendente
    [220, 196, 146.83].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
      gain.gain.setValueAtTime(0.11, ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.14 + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 1.25);
    });
  }

  playArrowWhistle() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  playArrowThud() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(135, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  /** Cuernos y gritos distantes de victoria de Argos al cierre de Escena 2 */
  playArgosVictoryCries() {
    this.playWarHorn();
    const ctx = this.ensureContext();
    if (!ctx) return;

    [0.3, 0.75, 1.2].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(190 + offset * 40, ctx.currentTime + offset);
      osc.frequency.linearRampToValueAtTime(240, ctx.currentTime + offset + 0.35);
      gain.gain.setValueAtTime(0.045, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.55);
    });
  }

  // ==========================================================================
  // PAISAJES SONOROS Y EFECTOS DE ESCENA 3: CENIZAS DEL DEBER
  // ==========================================================================

  createNoiseBuffer(ctx, seconds = 2) {
    const size = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /** Viento ceniciento, brasas lejanas y acorde sombrío (Escena 3 - Hito 3.1) */
  playAshenWindAmbient() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopAmbient();

    const wind = ctx.createBufferSource();
    wind.buffer = this.createNoiseBuffer(ctx, 2.5);
    wind.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(280, ctx.currentTime);
    filter.Q.setValueAtTime(1.6, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 1.4);

    wind.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    wind.start();

    // Zumbido grave trágico
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = "triangle";
    drone.frequency.setValueAtTime(65.41, ctx.currentTime);
    droneGain.gain.setValueAtTime(0.035, ctx.currentTime);
    drone.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone.start();

    this.ambientGain = masterGain;
    this.ambientNodes.push(wind, filter, masterGain, drone, droneGain);

    const crackleTimer = this.scene.time.addEvent({
      delay: 750,
      loop: true,
      callback: () => {
        if (Math.random() < 0.55) this.playFireCrackle(0.035);
      }
    });
    this.activeTimers.push(crackleTimer);
  }

  playFireCrackle(volume = 0.05) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const src = ctx.createBufferSource();
    src.buffer = this.createNoiseBuffer(ctx, 0.14);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(1400 + Math.random() * 1400, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.12);

    src.connect(hp);
    hp.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  /** Respiración agitada, quejidos de dolor, lamentos lejanos y llamas activas (Hito 3.2) */
  playDesperateSprintAudio() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopAmbient();

    const blaze = ctx.createBufferSource();
    blaze.buffer = this.createNoiseBuffer(ctx, 2);
    blaze.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(620, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.085, ctx.currentTime);

    blaze.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    blaze.start();

    this.ambientGain = gain;
    this.ambientNodes.push(blaze, filter, gain);

    const breathTimer = this.scene.time.addEvent({
      delay: 520,
      loop: true,
      callback: () => this.playAgitatedBreathBurst()
    });
    const lamentTimer = this.scene.time.addEvent({
      delay: 2400,
      loop: true,
      callback: () => {
        if (Math.random() < 0.7) this.playDistantLament();
        this.playFireCrackle(0.07);
      }
    });
    this.activeTimers.push(breathTimer, lamentTimer);
  }

  playAgitatedBreathBurst() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const src = ctx.createBufferSource();
    src.buffer = this.createNoiseBuffer(ctx, 0.24);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(720, ctx.currentTime);
    bp.frequency.linearRampToValueAtTime(480, ctx.currentTime + 0.22);
    bp.Q.setValueAtTime(2.2, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.005, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.23);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  playDistantLament() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const base = 310 + Math.random() * 90;
    osc.frequency.setValueAtTime(base, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(base * 0.74, ctx.currentTime + 1.1);
    gain.gain.setValueAtTime(0.002, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.032, ctx.currentTime + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  }

  /** Caída resonante de la lanza Dory sobre piedra y ceniza (Hito 3.3) */
  playSpearDrop() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    [0, 0.14].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(idx === 0 ? 480 : 320, ctx.currentTime + offset);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + offset + 0.18);
      gain.gain.setValueAtTime(idx === 0 ? 0.18 : 0.1, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.24);
    });
  }

  /** Acorde fúnebre para el quiebre final y cierre con título THE LAST SPARTAN */
  playTragicClosingChord() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [146.83, 174.61, 220.0, 261.63]; // Dm7 sombrío
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.002, ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + idx * 0.12 + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + 4.3);
    });
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
