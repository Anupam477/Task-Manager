/**
 * Integrated Pomodoro Focus Engine for StudyFlow
 */

import { soundManager } from './audio.js';
import { StorageManager } from './storage.js';

export class PomodoroTimer {
  constructor(onTick, onComplete) {
    this.durations = {
      focus: 25 * 60,
      short: 5 * 60,
      long: 15 * 60
    };
    this.currentMode = 'focus';
    this.timeLeft = this.durations.focus;
    this.timerId = null;
    this.isRunning = false;
    this.activeTask = null;
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  setMode(mode) {
    if (!this.durations[mode]) return;
    this.pause();
    this.currentMode = mode;
    this.timeLeft = this.durations[mode];
    if (this.onTick) this.onTick(this.formatTime(), this.currentMode);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timerId = setInterval(() => {
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        this.finish();
      } else {
        if (this.onTick) this.onTick(this.formatTime(), this.currentMode);
      }
    }, 1000);

    if (this.onTick) this.onTick(this.formatTime(), this.currentMode);
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  reset() {
    this.pause();
    this.timeLeft = this.durations[this.currentMode];
    if (this.onTick) this.onTick(this.formatTime(), this.currentMode);
  }

  finish() {
    this.pause();
    this.timeLeft = 0;
    if (this.onTick) this.onTick(this.formatTime(), this.currentMode);

    soundManager.playTimerBell();

    if (this.currentMode === 'focus') {
      StorageManager.addFocusMinutes(25);
      StorageManager.incrementFocusSession();
    }

    if (this.onComplete) {
      this.onComplete(this.currentMode, this.activeTask);
    }

    // Reset for next round
    setTimeout(() => {
      if (this.currentMode === 'focus') {
        this.setMode('short');
      } else {
        this.setMode('focus');
      }
    }, 1500);
  }

  setFocusedTask(task) {
    this.activeTask = task;
  }

  formatTime() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
