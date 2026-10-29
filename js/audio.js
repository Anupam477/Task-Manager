/**
 * StudyFlow Web Audio Engine
 * Pure procedural synthesis for UI chimes & ambient study soundscapes,
 * plus custom user audio file playback (MP3/WAV/OGG) with IndexedDB persistence.
 */

class AudioStorage {
  static openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('StudyFlowAudioDB', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  static async saveTrack(name, blob) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('tracks', 'readwrite');
        const store = tx.objectStore('tracks');
        store.put({ name, blob, date: Date.now() }, 'current_track');
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Failed to save audio to IndexedDB:', e);
    }
  }

  static async loadTrack() {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('tracks', 'readonly');
        const store = tx.objectStore('tracks');
        const req = store.get('current_track');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return null;
    }
  }

  static async clearTrack() {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('tracks', 'readwrite');
        const store = tx.objectStore('tracks');
        store.delete('current_track');
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {}
  }
}

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.isMuted = false;
    this.volume = 0.45;
    this.activeNodes = [];
    this.customAudio = null;
    this.customTrackName = '';
    this.customAudioUrl = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Subtle UI click sound
   */
  playClickSound() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {}
  }

  /**
   * Delightful completion chime (Pentatonic melody)
   */
  playCompletionChime() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.07);

        gain.gain.setValueAtTime(0, now + index * 0.07);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.07);
        osc.stop(now + index * 0.07 + 0.5);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  /**
   * Pomodoro timer finish bell
   */
  playTimerBell() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch (e) {
      console.warn('Timer bell error:', e);
    }
  }

  /**
   * Triumphant Level Up / Badge Unlock Fanfare
   */
  playLevelUpSound() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6

      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = index === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.22, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.65);
      });
    } catch (e) {}
  }

  /* ---------------- Custom User Audio Support ---------------- */

  async loadSavedCustomTrack() {
    try {
      const record = await AudioStorage.loadTrack();
      if (record && record.blob) {
        if (this.customAudioUrl) {
          URL.revokeObjectURL(this.customAudioUrl);
        }
        this.customAudioUrl = URL.createObjectURL(record.blob);
        this.customAudio = new Audio(this.customAudioUrl);
        this.customAudio.loop = true;
        this.customAudio.volume = this.volume;
        this.customTrackName = record.name || 'Custom Track';
        return { name: this.customTrackName };
      }
    } catch (e) {}
    return null;
  }

  async setCustomTrack(file) {
    if (!file) return null;
    this.stopAmbient();

    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
    }

    this.customAudioUrl = URL.createObjectURL(file);
    this.customAudio = new Audio(this.customAudioUrl);
    this.customAudio.loop = true;
    this.customAudio.volume = this.volume;
    this.customTrackName = file.name;

    await AudioStorage.saveTrack(file.name, file);
    return file.name;
  }

  async removeCustomTrack() {
    this.stopAmbient();
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
      this.customAudioUrl = null;
    }
    this.customAudio = null;
    this.customTrackName = '';
    await AudioStorage.clearTrack();
  }

  /**
   * Start Ambient Sound: procedural preset or custom user audio
   */
  startAmbient(type) {
    this.stopAmbient();
    if (type === 'off') return;

    // Custom user track playback
    if (type === 'custom') {
      if (this.customAudio) {
        try {
          this.customAudio.currentTime = 0;
          this.customAudio.volume = this.volume;
          this.customAudio.play().catch(err => console.warn('Custom audio playback error:', err));
        } catch (e) {}
      }
      return;
    }

    try {
      this.init();
      this.activeNodes = [];

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'rain') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(this.ambientGain);
        whiteNoise.start();
        this.activeNodes.push(whiteNoise);

      } else if (type === 'brown') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 0.8;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(this.ambientGain);
        noise.start();
        this.activeNodes.push(noise);

      } else if (type === 'waves') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.03 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 0.6;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(this.ambientGain.gain);
        lfo.start();

        noise.connect(filter);
        filter.connect(this.ambientGain);
        noise.start();

        this.activeNodes.push(noise, lfo);

      } else if (type === 'campfire') {
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const crackle = Math.random() > 0.9985 ? (Math.random() * 2 - 1) * 3 : 0;
          output[i] = (white * 0.08) + crackle;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(this.ambientGain);
        noise.start();
        this.activeNodes.push(noise);

      } else if (type === 'binaural') {
        const merger = this.ctx.createChannelMerger(2);

        const oscL = this.ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(216, this.ctx.currentTime);

        const oscR = this.ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(226, this.ctx.currentTime);

        const toneGain = this.ctx.createGain();
        toneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(toneGain);
        toneGain.connect(this.ambientGain);

        oscL.start();
        oscR.start();
        this.activeNodes.push(oscL, oscR);

      } else if (type === 'clock') {
        let isTick = true;

        const playTick = () => {
          if (!this.ambientGain) return;
          try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(isTick ? 1200 : 900, now);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
            osc.connect(gain);
            gain.connect(this.ambientGain);
            osc.start(now);
            osc.stop(now + 0.04);
            isTick = !isTick;
          } catch (e) {}
        };

        const tickTimer = setInterval(playTick, 1000);
        this.tickTimer = tickTimer;
        playTick();
      }
    } catch (e) {
      console.warn('Ambient sound failed:', e);
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  stopAmbient() {
    if (this.customAudio) {
      try {
        this.customAudio.pause();
      } catch (e) {}
    }
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    if (this.activeNodes && this.activeNodes.length > 0) {
      this.activeNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch (e) {}
      this.ambientGain = null;
    }
  }
}

export const soundManager = new AudioEngine();
