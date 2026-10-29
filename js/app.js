/**
 * StudyFlow Pro — Main Application Driver
 * Advanced Glassmorphic Task Suite with Smart NLP, Voice Input, Kanban, Matrix, Timeline,
 * Fullscreen Zen Mode, Command Palette (Ctrl+K), Active Recall Flashcards, RPG Gamification & Scratchpad
 */

import { soundManager } from './audio.js';
import { triggerConfetti } from './confetti.js';
import { StorageManager, samplePresets, BADGE_DEFINITIONS } from './storage.js';
import { PomodoroTimer } from './pomodoro.js';
import { SmartParser } from './ai-parser.js';

class StudyFlowApp {
  constructor() {
    this.tasks = StorageManager.getTasks();
    this.currentView = 'list'; // 'list' | 'kanban' | 'matrix' | 'timeline'
    this.currentFilter = 'all';
    this.currentSort = 'default';
    this.searchQuery = '';
    this.drawerSubtasks = [];
    this.lastDeletedTask = null;
    this.undoTimeout = null;
    this.isListeningVoice = false;
    this.speechRecognition = null;

    // Flashcard state
    this.flashcardsList = [];
    this.currentCardIndex = 0;
    this.isCardFlipped = false;

    // Command palette state
    this.paletteCommands = [];
    this.selectedPaletteIndex = 0;

    this.zenQuotes = [
      '"Focus is a muscle. The more you practice, the stronger it gets."',
      '"Small disciplines repeated with consistency every day lead to great achievements."',
      '"Do the hard jobs first. The easy jobs will take care of themselves."',
      '"It always seems impossible until it is done."',
      '"Action is the foundational key to all success."',
      '"Deep work is the superpower of the 21st century."'
    ];
    this.currentQuoteIndex = 0;

    this.initDOM();
    this.initDate();
    this.initTheme();
    this.initPomodoro();
    this.initGamification();
    this.initScratchpad();
    this.initSpeechRecognition();
    this.initCommandPalette();
    this.initEventListeners();
    this.render();
  }

  initDOM() {
    // Overview & Header
    this.totalCountEl = document.getElementById('total-count');
    this.doneCountEl = document.getElementById('done-count');
    this.progressBarFill = document.getElementById('progress-bar-fill');
    this.progressPercentageText = document.getElementById('progress-percentage-text');
    this.remainingCountText = document.getElementById('remaining-count-text');
    this.streakCountEl = document.getElementById('streak-count');
    this.dateBadgeEl = document.getElementById('current-date-badge');

    // Gamification
    this.gamificationBtn = document.getElementById('gamification-btn');
    this.navLevelBadge = document.getElementById('nav-level-badge');
    this.navLevelFill = document.getElementById('nav-level-fill');
    this.navXpLabel = document.getElementById('nav-xp-label');
    this.gamificationModalBackdrop = document.getElementById('gamification-modal-backdrop');
    this.gamificationCloseBtn = document.getElementById('gamification-close-btn');
    this.modalLevelNum = document.getElementById('modal-level-num');
    this.modalLevelTitle = document.getElementById('modal-level-title');
    this.modalLevelXp = document.getElementById('modal-level-xp');
    this.modalLevelFill = document.getElementById('modal-level-fill');
    this.badgesUnlockedCount = document.getElementById('badges-unlocked-count');
    this.badgesGrid = document.getElementById('badges-grid');
    this.xpToastContainer = document.getElementById('xp-toast-container');

    // Command Palette
    this.commandPaletteBtn = document.getElementById('command-palette-btn');
    this.commandPaletteBackdrop = document.getElementById('command-palette-backdrop');
    this.commandPaletteInput = document.getElementById('command-palette-input');
    this.commandResultsList = document.getElementById('command-results-list');

    // Flashcards
    this.flashcardsBtn = document.getElementById('flashcards-btn');
    this.flashcardsModalBackdrop = document.getElementById('flashcards-modal-backdrop');
    this.flashcardsCloseBtn = document.getElementById('flashcards-close-btn');
    this.flashcardInner = document.getElementById('flashcard-inner');
    this.fcCategory = document.getElementById('fc-category');
    this.fcFrontTitle = document.getElementById('fc-front-title');
    this.fcBackBody = document.getElementById('fc-back-body');
    this.fcPrevBtn = document.getElementById('fc-prev-btn');
    this.fcNextBtn = document.getElementById('fc-next-btn');
    this.fcGotitBtn = document.getElementById('fc-gotit-btn');
    this.fcCounter = document.getElementById('fc-counter');

    // Scratchpad
    this.scratchpadToggleBtn = document.getElementById('scratchpad-toggle-btn');
    this.scratchpadDrawer = document.getElementById('scratchpad-drawer');
    this.scratchpadCloseBtn = document.getElementById('scratchpad-close-btn');
    this.scratchpadTextarea = document.getElementById('scratchpad-textarea');
    this.scratchpadToTaskBtn = document.getElementById('scratchpad-to-task-btn');

    // Input & Drawer
    this.taskInput = document.getElementById('new-task-input');
    this.addTaskBtn = document.getElementById('add-task-btn');
    this.voiceInputBtn = document.getElementById('voice-input-btn');
    this.advancedToggleBtn = document.getElementById('advanced-toggle-btn');
    this.advancedDrawer = document.getElementById('advanced-drawer');
    this.categorySelect = document.getElementById('task-category-select');
    this.prioritySelect = document.getElementById('task-priority-select');
    this.dueDateInput = document.getElementById('task-due-date');
    this.recurringSelect = document.getElementById('task-recurring-select');
    this.tagsInput = document.getElementById('task-tags-input');
    this.notesInput = document.getElementById('task-notes-input');
    this.pomoStepVal = document.getElementById('pomo-step-val');
    this.pomoStepDec = document.getElementById('pomo-step-dec');
    this.pomoStepInc = document.getElementById('pomo-step-inc');
    this.magicBreakdownBtn = document.getElementById('magic-breakdown-btn');
    this.drawerSubtaskInput = document.getElementById('drawer-subtask-input');
    this.drawerAddSubtaskBtn = document.getElementById('drawer-add-subtask-btn');
    this.drawerSubtaskList = document.getElementById('drawer-subtask-list');

    // View Switcher
    this.viewTabBtns = document.querySelectorAll('.view-tab-btn');
    this.taskList = document.getElementById('task-list');
    this.kanbanView = document.getElementById('kanban-view');
    this.matrixView = document.getElementById('matrix-view');
    this.timelineView = document.getElementById('timeline-view');

    // Search, Filter & Sort
    this.searchInput = document.getElementById('search-tasks-input');
    this.clearSearchBtn = document.getElementById('clear-search-btn');
    this.filterPills = document.querySelectorAll('.filter-pill');
    this.sortSelect = document.getElementById('sort-tasks-select');
    this.emptyStateCard = document.getElementById('empty-state-card');
    this.loadSampleBtn = document.getElementById('load-sample-btn');

    // Nav & Menus
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.soundMenu = document.getElementById('sound-menu');
    this.soundDropdown = document.getElementById('sound-dropdown-container');
    this.soundOptions = document.querySelectorAll('.sound-option');
    this.soundCurrentLabel = document.getElementById('sound-current-label');
    this.ambientVolumeSlider = document.getElementById('ambient-volume');
    this.soundEqualizer = document.getElementById('sound-equalizer');

    this.themeBtn = document.getElementById('theme-btn');
    this.themeDropdown = document.getElementById('theme-dropdown-container');
    this.themeOptions = document.querySelectorAll('.theme-option');

    this.pomodoroToggleBtn = document.getElementById('pomodoro-toggle-btn');
    this.pomodoroPanel = document.getElementById('pomodoro-panel');
    this.pomoCloseBtn = document.getElementById('pomo-close-btn');
    this.pomoZenBtn = document.getElementById('pomo-zen-btn');

    this.zenModeBtn = document.getElementById('zen-mode-btn');
    this.zenOverlay = document.getElementById('zen-overlay');
    this.zenExitBtn = document.getElementById('zen-exit-btn');
    this.zenTimerDisplay = document.getElementById('zen-timer-display');
    this.zenTaskTitle = document.getElementById('zen-task-title');
    this.zenQuote = document.getElementById('zen-quote');
    this.zenToggleBtn = document.getElementById('zen-toggle-btn');
    this.zenResetBtn = document.getElementById('zen-reset-btn');
    this.zenSoundToggleBtn = document.getElementById('zen-sound-toggle-btn');

    this.statsToggleBtn = document.getElementById('stats-toggle-btn');
    this.statsModalBackdrop = document.getElementById('stats-modal-backdrop');
    this.statsCloseBtn = document.getElementById('stats-close-btn');

    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsModalBackdrop = document.getElementById('settings-modal-backdrop');
    this.settingsCloseBtn = document.getElementById('settings-close-btn');

    // Edit Modal
    this.editModalBackdrop = document.getElementById('edit-modal-backdrop');
    this.editModalCloseBtn = document.getElementById('modal-close-btn');
    this.editModalCancelBtn = document.getElementById('edit-modal-cancel');
    this.editTaskForm = document.getElementById('edit-task-form');
    this.editTaskId = document.getElementById('edit-task-id');
    this.editTaskTitle = document.getElementById('edit-task-title');
    this.editTaskCategory = document.getElementById('edit-task-category');
    this.editTaskPriority = document.getElementById('edit-task-priority');
    this.editTaskStatus = document.getElementById('edit-task-status');
    this.editTaskRecurring = document.getElementById('edit-task-recurring');
    this.editTaskDue = document.getElementById('edit-task-due');
    this.editTaskPomos = document.getElementById('edit-task-pomos');
    this.editTaskTags = document.getElementById('edit-task-tags');
    this.editTaskNotes = document.getElementById('edit-task-notes');

    // Toasts
    this.toastContainer = document.getElementById('toast-container');
  }

  initDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const todayStr = new Date().toLocaleDateString('en-US', options);
    if (this.dateBadgeEl) {
      this.dateBadgeEl.textContent = todayStr;
    }
  }

  initTheme() {
    const savedTheme = StorageManager.getTheme();
    this.applyTheme(savedTheme);
  }

  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    StorageManager.saveTheme(theme);
    this.themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === theme);
    });

    const themeColors = {
      sky: '#cadff3',
      midnight: '#0d131f',
      cyberpunk: '#130924',
      latte: '#ede6de',
      sunset: '#fed7aa',
      arctic: '#e0f2fe',
      sakura: '#fce7f3',
      emerald: '#d3ebd9',
      amoled: '#000000'
    };
    const meta = document.getElementById('theme-color-meta');
    if (meta && themeColors[theme]) {
      meta.setAttribute('content', themeColors[theme]);
    }
  }

  initPomodoro() {
    this.timerDisplay = document.getElementById('timer-display');
    this.timerTaskLabel = document.getElementById('timer-task-label');
    this.timerToggleBtn = document.getElementById('timer-toggle-btn');
    this.timerResetBtn = document.getElementById('timer-reset-btn');
    this.pomoTabs = document.querySelectorAll('.pomo-tab');

    this.pomodoro = new PomodoroTimer(
      (formattedTime, mode) => {
        if (this.timerDisplay) this.timerDisplay.textContent = formattedTime;
        if (this.zenTimerDisplay) this.zenTimerDisplay.textContent = formattedTime;
        document.title = `(${formattedTime}) StudyFlow`;
      },
      (mode, task) => {
        document.title = 'StudyFlow Pro — Intelligent Glassmorphic Task & Study Suite';
        const title = mode === 'focus' ? '🎉 Focus Session Completed!' : '☕ Break Finished!';
        this.showToast(title);
        triggerConfetti();

        if (mode === 'focus') {
          this.awardXP(100, 'Focus Session Completed');
          const game = StorageManager.getGamification();
          if (game.totalFocusSessions >= 3) {
            this.checkUnlockBadge('pomo_master');
          }
        }
      }
    );

    this.timerToggleBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      const isRunning = this.pomodoro.toggle();
      this.syncPomoButtons(isRunning);
    });

    this.timerResetBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      this.pomodoro.reset();
      this.syncPomoButtons(false);
      document.title = 'StudyFlow Pro — Intelligent Glassmorphic Task & Study Suite';
    });

    this.pomoTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        soundManager.playClickSound();
        this.pomoTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.pomodoro.setMode(tab.dataset.mode);
        this.syncPomoButtons(false);
      });
    });

    this.pomodoroToggleBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      this.pomodoroPanel.classList.toggle('collapsed');
      if (!this.pomodoroPanel.classList.contains('collapsed')) {
        this.pomodoroPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    this.pomoCloseBtn.addEventListener('click', () => {
      this.pomodoroPanel.classList.add('collapsed');
    });

    // Zen Mode Connectors
    if (this.pomoZenBtn) {
      this.pomoZenBtn.addEventListener('click', () => this.enterZenMode());
    }
    if (this.zenModeBtn) {
      this.zenModeBtn.addEventListener('click', () => this.enterZenMode());
    }
    if (this.zenExitBtn) {
      this.zenExitBtn.addEventListener('click', () => this.exitZenMode());
    }
    if (this.zenToggleBtn) {
      this.zenToggleBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        const isRunning = this.pomodoro.toggle();
        this.syncPomoButtons(isRunning);
      });
    }
    if (this.zenResetBtn) {
      this.zenResetBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        this.pomodoro.reset();
        this.syncPomoButtons(false);
      });
    }
    if (this.zenSoundToggleBtn) {
      this.zenSoundToggleBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        const currentActive = document.querySelector('.sound-option.active');
        const currentSound = currentActive ? currentActive.dataset.sound : 'off';
        const sounds = ['off', 'rain', 'waves', 'brown', 'campfire', 'binaural', 'clock'];
        const nextIndex = (sounds.indexOf(currentSound) + 1) % sounds.length;
        const nextSound = sounds[nextIndex];

        soundManager.startAmbient(nextSound);
        this.soundOptions.forEach(opt => {
          opt.classList.toggle('active', opt.dataset.sound === nextSound);
        });

        const soundLabels = {
          off: 'Sound 🔇',
          rain: 'Rain 🌧️',
          waves: 'Waves 🌊',
          brown: 'Noise ☕',
          campfire: 'Campfire 🔥',
          binaural: 'Alpha 🧠',
          clock: 'Clock ⏱️'
        };
        this.soundCurrentLabel.textContent = soundLabels[nextSound] || 'Sound';
        this.zenSoundToggleBtn.textContent = `🔊 ${soundLabels[nextSound] || 'Ambient'}`;
      });
    }
  }

  syncPomoButtons(isRunning) {
    const label = isRunning ? 'Pause' : 'Resume';
    if (this.timerToggleBtn) {
      this.timerToggleBtn.textContent = this.pomodoro.timeLeft === this.pomodoro.durations[this.pomodoro.currentMode] && !isRunning ? 'Start Focus' : label;
      this.timerToggleBtn.classList.toggle('active', isRunning);
    }
    if (this.zenToggleBtn) {
      this.zenToggleBtn.textContent = label;
      this.zenToggleBtn.classList.toggle('active', isRunning);
    }
  }

  enterZenMode() {
    soundManager.playClickSound();
    this.zenOverlay.style.display = 'flex';
    this.zenQuote.textContent = this.zenQuotes[this.currentQuoteIndex % this.zenQuotes.length];
    this.currentQuoteIndex++;

    if (this.pomodoro.activeTask) {
      this.zenTaskTitle.textContent = this.pomodoro.activeTask.title;
    } else {
      this.zenTaskTitle.textContent = 'Deep Work Session';
    }

    this.checkUnlockBadge('zen_master');

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  exitZenMode() {
    soundManager.playClickSound();
    this.zenOverlay.style.display = 'none';
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  /* ---------------- Gamification & XP System ---------------- */

  initGamification() {
    this.updateGamificationUI();

    this.gamificationBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      this.openGamificationModal();
    });

    this.gamificationCloseBtn.addEventListener('click', () => {
      this.closeGamificationModal();
    });

    this.gamificationModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.gamificationModalBackdrop) this.closeGamificationModal();
    });
  }

  updateGamificationUI() {
    const game = StorageManager.getGamification();
    const lvlInfo = StorageManager.calculateLevel(game.xp);

    if (this.navLevelBadge) this.navLevelBadge.textContent = `Lv. ${lvlInfo.level}`;
    if (this.navLevelFill) this.navLevelFill.style.width = `${lvlInfo.percentage}%`;
    if (this.navXpLabel) this.navXpLabel.textContent = `${game.xp} XP`;
  }

  awardXP(amount, reason = '') {
    const result = StorageManager.addXP(amount);
    this.showXPToast(`+${amount} XP ${reason ? '· ' + reason : ''}`);
    this.updateGamificationUI();

    if (result.levelUp) {
      soundManager.playLevelUpSound();
      triggerConfetti();
      this.showToast(`👑 LEVEL UP! You reached Level ${result.newLevel} (${result.title})!`);
    }
  }

  showXPToast(msg) {
    if (!this.xpToastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.textContent = msg;
    this.xpToastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }

  checkUnlockBadge(badgeId) {
    const unlocked = StorageManager.unlockBadge(badgeId);
    if (unlocked) {
      soundManager.playLevelUpSound();
      triggerConfetti();
      const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
      this.showToast(`🏆 BADGE UNLOCKED: ${badgeDef ? badgeDef.name : badgeId}! (+${badgeDef ? badgeDef.xp : 50} XP)`);
      this.updateGamificationUI();
    }
  }

  openGamificationModal() {
    const game = StorageManager.getGamification();
    const lvlInfo = StorageManager.calculateLevel(game.xp);

    this.modalLevelNum.textContent = lvlInfo.level;
    this.modalLevelTitle.textContent = lvlInfo.title;
    this.modalLevelXp.textContent = `${lvlInfo.currentProgress} / ${lvlInfo.needed} XP (Total: ${game.xp} XP)`;
    this.modalLevelFill.style.width = `${lvlInfo.percentage}%`;

    const unlocked = game.unlockedBadges || [];
    this.badgesUnlockedCount.textContent = `${unlocked.length} / ${BADGE_DEFINITIONS.length} Unlocked`;

    this.badgesGrid.innerHTML = BADGE_DEFINITIONS.map(b => {
      const isUnlocked = unlocked.includes(b.id);
      return `
        <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" title="${b.desc}">
          <div class="badge-icon">${b.icon}</div>
          <div class="badge-name">${b.name}</div>
          <div class="badge-desc">${b.desc}</div>
          <div class="badge-xp-reward">${isUnlocked ? '✓ Unlocked' : `+${b.xp} XP`}</div>
        </div>
      `;
    }).join('');

    this.gamificationModalBackdrop.classList.add('open');
  }

  closeGamificationModal() {
    this.gamificationModalBackdrop.classList.remove('open');
  }

  /* ---------------- Command Palette (Ctrl+K) ---------------- */

  initCommandPalette() {
    this.commandPaletteBtn.addEventListener('click', () => this.openCommandPalette());

    this.commandPaletteInput.addEventListener('input', (e) => {
      this.filterPaletteCommands(e.target.value.trim().toLowerCase());
    });

    this.commandPaletteInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedPaletteIndex = (this.selectedPaletteIndex + 1) % this.paletteCommands.length;
        this.renderPaletteResults();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedPaletteIndex = (this.selectedPaletteIndex - 1 + this.paletteCommands.length) % this.paletteCommands.length;
        this.renderPaletteResults();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.paletteCommands[this.selectedPaletteIndex]) {
          this.executePaletteCommand(this.paletteCommands[this.selectedPaletteIndex]);
        }
      } else if (e.key === 'Escape') {
        this.closeCommandPalette();
      }
    });

    this.commandPaletteBackdrop.addEventListener('click', (e) => {
      if (e.target === this.commandPaletteBackdrop) this.closeCommandPalette();
    });
  }

  openCommandPalette() {
    soundManager.playClickSound();
    this.commandPaletteBackdrop.style.display = 'flex';
    this.commandPaletteInput.value = '';
    this.filterPaletteCommands('');
    setTimeout(() => this.commandPaletteInput.focus(), 50);
  }

  closeCommandPalette() {
    this.commandPaletteBackdrop.style.display = 'none';
  }

  filterPaletteCommands(query) {
    const baseCommands = [
      { id: 'new_task', title: 'Add New Task', category: 'Action', icon: '➕', action: () => { this.closeCommandPalette(); this.taskInput.focus(); } },
      { id: 'zen_mode', title: 'Open Zen Focus Mode (Z)', category: 'Focus', icon: '🧘', action: () => { this.closeCommandPalette(); this.enterZenMode(); } },
      { id: 'pomo_toggle', title: 'Start / Pause Pomodoro Timer', category: 'Focus', icon: '🍅', action: () => { this.closeCommandPalette(); this.timerToggleBtn.click(); } },
      { id: 'view_list', title: 'Switch to List View', category: 'View', icon: '📋', action: () => { this.closeCommandPalette(); this.switchView('list'); } },
      { id: 'view_kanban', title: 'Switch to Kanban Board', category: 'View', icon: '📑', action: () => { this.closeCommandPalette(); this.switchView('kanban'); } },
      { id: 'view_matrix', title: 'Switch to Eisenhower Matrix', category: 'View', icon: '🎯', action: () => { this.closeCommandPalette(); this.switchView('matrix'); } },
      { id: 'view_timeline', title: 'Switch to Timeline View', category: 'View', icon: '📅', action: () => { this.closeCommandPalette(); this.switchView('timeline'); } },
      { id: 'scratchpad', title: 'Toggle Quick Scratchpad', category: 'Notes', icon: '📝', action: () => { this.closeCommandPalette(); this.toggleScratchpad(); } },
      { id: 'flashcards', title: 'Start Active Recall Flashcards', category: 'Study', icon: '🎴', action: () => { this.closeCommandPalette(); this.openFlashcardsModal(); } },
      { id: 'badges', title: 'View Mastery Badges & Level', category: 'Profile', icon: '🏆', action: () => { this.closeCommandPalette(); this.openGamificationModal(); } },
      { id: 'theme_sky', title: 'Set Theme: Sky Mist', category: 'Theme', icon: '🎨', action: () => { this.closeCommandPalette(); this.applyTheme('sky'); } },
      { id: 'theme_midnight', title: 'Set Theme: Midnight Glass', category: 'Theme', icon: '🌙', action: () => { this.closeCommandPalette(); this.applyTheme('midnight'); } },
      { id: 'theme_cyberpunk', title: 'Set Theme: Tokyo Cyber', category: 'Theme', icon: '⚡', action: () => { this.closeCommandPalette(); this.applyTheme('cyberpunk'); } },
      { id: 'theme_latte', title: 'Set Theme: Cozy Latte', category: 'Theme', icon: '☕', action: () => { this.closeCommandPalette(); this.applyTheme('latte'); } },
      { id: 'theme_amoled', title: 'Set Theme: OLED Carbon', category: 'Theme', icon: '🖤', action: () => { this.closeCommandPalette(); this.applyTheme('amoled'); } }
    ];

    // Add matching tasks
    const taskCommands = this.tasks.slice(0, 8).map(t => ({
      id: `task_${t.id}`,
      title: `Task: ${t.title}`,
      category: t.category,
      icon: t.completed ? '✅' : '📌',
      action: () => {
        this.closeCommandPalette();
        this.openEditModal(t.id);
      }
    }));

    const all = [...baseCommands, ...taskCommands];

    if (!query) {
      this.paletteCommands = all.slice(0, 10);
    } else {
      this.paletteCommands = all.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }

    this.selectedPaletteIndex = 0;
    this.renderPaletteResults();
  }

  renderPaletteResults() {
    if (this.paletteCommands.length === 0) {
      this.commandResultsList.innerHTML = `<div style="padding:14px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No matching commands or tasks found.</div>`;
      return;
    }

    this.commandResultsList.innerHTML = this.paletteCommands.map((cmd, idx) => `
      <div class="palette-item ${idx === this.selectedPaletteIndex ? 'selected' : ''}" data-index="${idx}">
        <div class="palette-item-left">
          <span>${cmd.icon}</span>
          <span>${this.escapeHtml(cmd.title)}</span>
        </div>
        <span class="palette-item-category">${cmd.category}</span>
      </div>
    `).join('');

    this.commandResultsList.querySelectorAll('.palette-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index, 10);
        if (this.paletteCommands[idx]) {
          this.executePaletteCommand(this.paletteCommands[idx]);
        }
      });
    });
  }

  executePaletteCommand(cmd) {
    if (cmd && cmd.action) {
      soundManager.playClickSound();
      cmd.action();
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    this.viewTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    this.render();
  }

  /* ---------------- Active Recall Flashcards Mode ---------------- */

  openFlashcardsModal() {
    soundManager.playClickSound();
    // Build flashcards from Study/Exam tasks or tasks with notes/subtasks
    const eligibleTasks = this.tasks.filter(t => !t.completed && (t.category === 'Study' || t.category === 'Exam' || t.notes || (t.subtasks && t.subtasks.length > 0)));

    this.flashcardsList = eligibleTasks.length > 0 ? eligibleTasks : this.tasks.slice(0, 5);

    if (this.flashcardsList.length === 0) {
      this.showToast('Add some tasks to practice flashcards!');
      return;
    }

    this.currentCardIndex = 0;
    this.isCardFlipped = false;
    this.flashcardInner.classList.remove('flipped');
    this.renderCurrentFlashcard();
    this.flashcardsModalBackdrop.classList.add('open');
  }

  closeFlashcardsModal() {
    this.flashcardsModalBackdrop.classList.remove('open');
  }

  renderCurrentFlashcard() {
    const card = this.flashcardsList[this.currentCardIndex];
    if (!card) return;

    this.isCardFlipped = false;
    this.flashcardInner.classList.remove('flipped');

    this.fcCategory.textContent = `${card.category} · PRIORITY: ${card.priority.toUpperCase()}`;
    this.fcFrontTitle.textContent = card.title;

    let backHtml = '';
    if (card.notes) {
      backHtml += `<p style="margin-bottom:8px;font-style:italic;"><strong>Notes:</strong> ${this.escapeHtml(card.notes)}</p>`;
    }
    if (card.subtasks && card.subtasks.length > 0) {
      backHtml += `<strong>Action Steps:</strong><ul style="padding-left:16px;margin-top:4px;">` + 
        card.subtasks.map(s => `<li>${this.escapeHtml(s.title)}</li>`).join('') + `</ul>`;
    }
    if (!card.notes && (!card.subtasks || card.subtasks.length === 0)) {
      backHtml = `<p>Target: Complete in ${card.pomodoros || 1} Pomodoro focus block(s).</p>`;
    }

    this.fcBackBody.innerHTML = backHtml;
    this.fcCounter.textContent = `Card ${this.currentCardIndex + 1} of ${this.flashcardsList.length}`;
  }

  toggleFlashcardFlip() {
    soundManager.playClickSound();
    this.isCardFlipped = !this.isCardFlipped;
    this.flashcardInner.classList.toggle('flipped', this.isCardFlipped);
  }

  /* ---------------- Quick Scratchpad Dock ---------------- */

  initScratchpad() {
    this.scratchpadTextarea.value = StorageManager.getScratchpad();

    this.scratchpadToggleBtn.addEventListener('click', () => this.toggleScratchpad());
    this.scratchpadCloseBtn.addEventListener('click', () => this.closeScratchpad());

    this.scratchpadTextarea.addEventListener('input', (e) => {
      StorageManager.saveScratchpad(e.target.value);
    });

    this.scratchpadToTaskBtn.addEventListener('click', () => {
      const text = this.scratchpadTextarea.value.trim();
      if (!text) return;

      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const firstLine = lines[0].replace(/^[-*•\d.]+\s*/, '').trim();
        const parsed = SmartParser.parse(firstLine);

        const newTask = {
          id: 'task-' + Date.now(),
          title: parsed.title,
          category: parsed.category,
          priority: parsed.priority,
          status: 'todo',
          dueDate: parsed.dueDate,
          pomodoros: parsed.pomodoros,
          completed: false,
          recurring: 'none',
          tags: parsed.tags,
          notes: '',
          createdAt: Date.now(),
          subtasks: []
        };

        this.tasks.unshift(newTask);
        StorageManager.saveTasks(this.tasks);

        // Remove first line from scratchpad
        lines.shift();
        this.scratchpadTextarea.value = lines.join('\n');
        StorageManager.saveScratchpad(this.scratchpadTextarea.value);

        soundManager.playClickSound();
        this.render();
        this.showToast(`Converted note line to task!`);
      }
    });
  }

  toggleScratchpad() {
    soundManager.playClickSound();
    this.scratchpadDrawer.classList.toggle('collapsed');
    if (!this.scratchpadDrawer.classList.contains('collapsed')) {
      this.scratchpadTextarea.focus();
    }
  }

  closeScratchpad() {
    this.scratchpadDrawer.classList.add('collapsed');
  }

  /* ---------------- Speech Recognition ---------------- */

  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.speechRecognition = new SpeechRec();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onstart = () => {
        this.isListeningVoice = true;
        this.voiceInputBtn.classList.add('listening');
        this.showToast('🎙️ Listening... Speak your task now');
      };

      this.speechRecognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        if (spokenText) {
          this.taskInput.value = spokenText;
          this.showToast(`Recognized: "${spokenText}"`);
          setTimeout(() => this.taskInput.focus(), 100);
        }
      };

      this.speechRecognition.onerror = () => {
        this.isListeningVoice = false;
        this.voiceInputBtn.classList.remove('listening');
      };

      this.speechRecognition.onend = () => {
        this.isListeningVoice = false;
        this.voiceInputBtn.classList.remove('listening');
      };

      this.voiceInputBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        if (this.isListeningVoice) {
          this.speechRecognition.stop();
        } else {
          try {
            this.speechRecognition.start();
          } catch (e) {
            this.showToast('Voice microphone unavailable');
          }
        }
      });
    } else {
      this.voiceInputBtn.addEventListener('click', () => {
        this.showToast('Voice recognition requires Chrome or Edge browser.');
      });
    }
  }

  initEventListeners() {
    // Quick Add
    this.taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleAddTask();
      }
    });
    this.addTaskBtn.addEventListener('click', () => this.handleAddTask());

    // Drawer Toggle
    this.advancedToggleBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      const isCollapsed = this.advancedDrawer.classList.toggle('collapsed');
      this.advancedToggleBtn.classList.toggle('active', !isCollapsed);
    });

    // Magic AI Subtask Breakdown Button
    if (this.magicBreakdownBtn) {
      this.magicBreakdownBtn.addEventListener('click', () => {
        soundManager.playClickSound();
        const text = this.taskInput.value.trim() || 'Study Session';
        const cat = this.categorySelect.value || 'Study';
        const generated = SmartParser.generateMagicSubtasks(text, cat);
        this.drawerSubtasks = [...this.drawerSubtasks, ...generated];
        this.renderDrawerSubtasks();
        this.showToast(`✨ Generated ${generated.length} actionable steps!`);
      });
    }

    // Pomodoro stepper in drawer
    let currentPomos = 1;
    this.pomoStepInc.addEventListener('click', () => {
      soundManager.playClickSound();
      if (currentPomos < 8) currentPomos++;
      this.pomoStepVal.textContent = currentPomos;
    });
    this.pomoStepDec.addEventListener('click', () => {
      soundManager.playClickSound();
      if (currentPomos > 1) currentPomos--;
      this.pomoStepVal.textContent = currentPomos;
    });

    // Drawer subtasks breakdown
    this.drawerAddSubtaskBtn.addEventListener('click', () => this.handleAddDrawerSubtask());
    this.drawerSubtaskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleAddDrawerSubtask();
      }
    });

    // Flashcard Modal Events
    this.flashcardsBtn.addEventListener('click', () => this.openFlashcardsModal());
    this.flashcardsCloseBtn.addEventListener('click', () => this.closeFlashcardsModal());
    this.flashcardInner.addEventListener('click', () => this.toggleFlashcardFlip());
    this.fcPrevBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      if (this.currentCardIndex > 0) {
        this.currentCardIndex--;
        this.renderCurrentFlashcard();
      }
    });
    this.fcNextBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      if (this.currentCardIndex < this.flashcardsList.length - 1) {
        this.currentCardIndex++;
        this.renderCurrentFlashcard();
      }
    });
    this.fcGotitBtn.addEventListener('click', () => {
      soundManager.playCompletionChime();
      this.awardXP(15, 'Flashcard Mastery');
      if (this.currentCardIndex < this.flashcardsList.length - 1) {
        this.currentCardIndex++;
        this.renderCurrentFlashcard();
      } else {
        triggerConfetti();
        this.showToast('🎉 All flashcards reviewed!');
        this.closeFlashcardsModal();
      }
    });

    // View Switcher (List, Kanban, Matrix, Timeline)
    this.viewTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClickSound();
        this.switchView(btn.dataset.view);
      });
    });

    // Search & Filter
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
      this.render();
    });

    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.clearSearchBtn.style.display = 'none';
      this.render();
    });

    // Sort Dropdown
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.render();
      });
    }

    this.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        soundManager.playClickSound();
        this.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentFilter = pill.dataset.filter;
        this.render();
      });
    });

    // Empty state load preset button
    this.loadSampleBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      this.tasks = [...samplePresets.exam];
      StorageManager.saveTasks(this.tasks);
      this.showToast('✨ Study sprint template loaded!');
      this.render();
    });

    // Quick empty state preset pills
    document.querySelectorAll('[data-preset-quick]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClickSound();
        const key = btn.dataset.presetQuick;
        if (samplePresets[key]) {
          this.tasks = [...samplePresets[key]];
          StorageManager.saveTasks(this.tasks);
          this.showToast(`✨ Loaded "${key}" preset!`);
          this.render();
        }
      });
    });

    // Ambient Sound Dropdown & Controls
    this.soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClickSound();
      this.soundDropdown.classList.toggle('open');
      this.themeDropdown.classList.remove('open');
    });

    this.soundOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        soundManager.playClickSound();
        this.soundOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const soundType = opt.dataset.sound;
        soundManager.startAmbient(soundType);

        if (soundType !== 'off') {
          if (this.soundEqualizer) this.soundEqualizer.style.display = 'inline-flex';
        } else {
          if (this.soundEqualizer) this.soundEqualizer.style.display = 'none';
        }

        const labels = {
          off: 'Sound',
          rain: 'Rain 🌧️',
          waves: 'Waves 🌊',
          brown: 'Noise ☕',
          campfire: 'Campfire 🔥',
          binaural: 'Alpha 🧠',
          clock: 'Clock ⏱️'
        };
        this.soundCurrentLabel.textContent = labels[soundType] || 'Sound';
        this.soundDropdown.classList.remove('open');
      });
    });

    this.ambientVolumeSlider.addEventListener('input', (e) => {
      const vol = e.target.value / 100;
      soundManager.setVolume(vol);
    });

    // Theme Switcher
    this.themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClickSound();
      this.themeDropdown.classList.toggle('open');
      this.soundDropdown.classList.remove('open');
    });

    this.themeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        soundManager.playClickSound();
        const theme = opt.dataset.theme;
        this.applyTheme(theme);
        this.themeDropdown.classList.remove('open');
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!this.soundDropdown.contains(e.target)) {
        this.soundDropdown.classList.remove('open');
      }
      if (!this.themeDropdown.contains(e.target)) {
        this.themeDropdown.classList.remove('open');
      }
    });

    // Stats Modal
    this.statsToggleBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      this.openStatsModal();
    });
    this.statsCloseBtn.addEventListener('click', () => this.closeStatsModal());
    this.statsModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.statsModalBackdrop) this.closeStatsModal();
    });

    // Settings Modal
    this.settingsBtn.addEventListener('click', () => {
      soundManager.playClickSound();
      this.openSettingsModal();
    });
    this.settingsCloseBtn.addEventListener('click', () => this.closeSettingsModal());
    this.settingsModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.settingsModalBackdrop) this.closeSettingsModal();
    });

    // Backup & Export Handlers
    document.getElementById('export-data-btn').addEventListener('click', () => this.exportBackup());
    document.getElementById('import-data-input').addEventListener('change', (e) => this.importBackup(e));
    document.getElementById('export-markdown-btn').addEventListener('click', () => this.exportMarkdown());
    document.getElementById('export-csv-btn').addEventListener('click', () => this.exportCSV());
    document.getElementById('print-agenda-btn').addEventListener('click', () => window.print());

    document.getElementById('clear-all-data-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all tasks?')) {
        this.tasks = [];
        StorageManager.saveTasks(this.tasks);
        this.closeSettingsModal();
        this.render();
        this.showToast('All tasks cleared.');
      }
    });

    // Preset buttons in settings
    document.querySelectorAll('.preset-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClickSound();
        const presetKey = btn.dataset.preset;
        if (samplePresets[presetKey]) {
          this.tasks = [...samplePresets[presetKey]];
          StorageManager.saveTasks(this.tasks);
          this.closeSettingsModal();
          this.render();
          this.showToast(`✨ Loaded "${presetKey}" preset!`);
        }
      });
    });

    // Edit Modal Events
    this.editModalCloseBtn.addEventListener('click', () => this.closeEditModal());
    this.editModalCancelBtn.addEventListener('click', () => this.closeEditModal());
    this.editModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.editModalBackdrop) this.closeEditModal();
    });
    this.editTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveEdit();
    });

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Command palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        this.openCommandPalette();
      } else if (e.key === ' ' && this.flashcardsModalBackdrop.classList.contains('open')) {
        // Spacebar flips flashcard
        e.preventDefault();
        this.toggleFlashcardFlip();
      } else if (e.key === '/' && document.activeElement !== this.taskInput && document.activeElement !== this.searchInput && document.activeElement !== this.scratchpadTextarea) {
        e.preventDefault();
        this.searchInput.focus();
      } else if ((e.key === 'z' || e.key === 'Z') && document.activeElement !== this.taskInput && document.activeElement !== this.searchInput && document.activeElement !== this.scratchpadTextarea && !this.editModalBackdrop.classList.contains('open') && !this.commandPaletteBackdrop.style.display.includes('flex')) {
        e.preventDefault();
        if (this.zenOverlay.style.display === 'flex') {
          this.exitZenMode();
        } else {
          this.enterZenMode();
        }
      } else if (e.key === 'Escape') {
        this.closeEditModal();
        this.closeStatsModal();
        this.closeSettingsModal();
        this.closeGamificationModal();
        this.closeFlashcardsModal();
        this.closeCommandPalette();
        this.closeScratchpad();
        this.exitZenMode();
        this.soundDropdown.classList.remove('open');
        this.themeDropdown.classList.remove('open');
      }
    });
  }

  handleAddDrawerSubtask() {
    const text = this.drawerSubtaskInput.value.trim();
    if (!text) return;

    this.drawerSubtasks.push({
      id: 'st-' + Date.now() + Math.random().toString(36).substr(2, 4),
      title: text,
      done: false
    });

    this.drawerSubtaskInput.value = '';
    this.renderDrawerSubtasks();
  }

  renderDrawerSubtasks() {
    this.drawerSubtaskList.innerHTML = this.drawerSubtasks.map((st, i) => `
      <li class="drawer-subtask-item">
        <span>${this.escapeHtml(st.title)}</span>
        <button type="button" class="remove-subtask-btn" data-index="${i}">✕</button>
      </li>
    `).join('');

    this.drawerSubtaskList.querySelectorAll('.remove-subtask-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        this.drawerSubtasks.splice(idx, 1);
        this.renderDrawerSubtasks();
      });
    });
  }

  handleAddTask() {
    const rawInput = this.taskInput.value.trim();
    if (!rawInput) return;

    const parsed = SmartParser.parse(rawInput);

    const category = (!this.advancedDrawer.classList.contains('collapsed') && this.categorySelect.value) ? this.categorySelect.value : parsed.category;
    const priority = (!this.advancedDrawer.classList.contains('collapsed') && this.prioritySelect.value) ? this.prioritySelect.value : parsed.priority;
    const dueDate = (!this.advancedDrawer.classList.contains('collapsed') && this.dueDateInput.value) ? this.dueDateInput.value : parsed.dueDate;
    const pomodoros = (!this.advancedDrawer.classList.contains('collapsed') && parseInt(this.pomoStepVal.textContent, 10)) ? parseInt(this.pomoStepVal.textContent, 10) : parsed.pomodoros;
    const recurring = this.recurringSelect ? this.recurringSelect.value : 'none';
    const notes = this.notesInput ? this.notesInput.value.trim() : '';

    let tags = [...parsed.tags];
    if (this.tagsInput && this.tagsInput.value.trim()) {
      const extraTags = this.tagsInput.value.trim().split(/[\s,]+/).map(t => t.startsWith('#') ? t : `#${t}`);
      tags = [...new Set([...tags, ...extraTags])];
    }

    const newTask = {
      id: 'task-' + Date.now(),
      title: parsed.title,
      category,
      priority,
      status: 'todo',
      dueDate,
      pomodoros,
      completed: false,
      recurring,
      tags,
      notes,
      createdAt: Date.now(),
      subtasks: [...this.drawerSubtasks]
    };

    this.tasks.unshift(newTask);
    StorageManager.saveTasks(this.tasks);

    // Reset fields
    this.taskInput.value = '';
    this.drawerSubtasks = [];
    this.renderDrawerSubtasks();
    this.advancedDrawer.classList.add('collapsed');
    this.advancedToggleBtn.classList.remove('active');
    this.pomoStepVal.textContent = '1';
    this.dueDateInput.value = '';
    if (this.tagsInput) this.tagsInput.value = '';
    if (this.notesInput) this.notesInput.value = '';

    soundManager.playClickSound();
    this.render();
    this.showToast('Task added successfully!');
  }

  toggleTaskCompletion(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.status = task.completed ? 'done' : 'todo';

    if (task.completed) {
      soundManager.playCompletionChime();
      StorageManager.recordCompletedTask();

      // Award XP
      this.awardXP(50, 'Task Completed');

      // Check Gamification Badges
      this.checkUnlockBadge('first_task');

      const completedCount = this.tasks.filter(t => t.completed).length;
      if (completedCount >= 5) {
        this.checkUnlockBadge('speed_demon');
      }

      const studyDone = this.tasks.filter(t => t.completed && (t.category === 'Study' || t.category === 'Exam')).length;
      if (studyDone >= 5) {
        this.checkUnlockBadge('scholar');
      }

      const streak = StorageManager.getStreak();
      if (streak.count >= 3) {
        this.checkUnlockBadge('streak_3');
      }

      // Check if all tasks are done
      const allDone = this.tasks.length > 0 && this.tasks.every(t => t.completed);
      if (allDone) {
        this.checkUnlockBadge('clean_slate');
        triggerConfetti();
        this.showToast('🎉 All tasks completed! Outstanding work!');
      } else {
        triggerConfetti();
      }
    }

    StorageManager.saveTasks(this.tasks);
    this.render();
  }

  shiftTaskStatus(taskId, newStatus) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = newStatus;
    task.completed = (newStatus === 'done');

    if (task.completed) {
      soundManager.playCompletionChime();
      StorageManager.recordCompletedTask();
      this.awardXP(50, 'Task Completed');
      triggerConfetti();
    } else {
      soundManager.playClickSound();
    }

    StorageManager.saveTasks(this.tasks);
    this.render();
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (sub) {
      sub.done = !sub.done;
      soundManager.playCompletionChime();
      if (sub.done) {
        this.awardXP(15, 'Action Step Done');
      }
      StorageManager.saveTasks(this.tasks);
      this.render();
    }
  }

  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return;

    this.lastDeletedTask = { task: this.tasks[index], index };
    this.tasks.splice(index, 1);
    StorageManager.saveTasks(this.tasks);
    this.render();

    this.showUndoToast('Task deleted', () => {
      if (this.lastDeletedTask) {
        this.tasks.splice(this.lastDeletedTask.index, 0, this.lastDeletedTask.task);
        StorageManager.saveTasks(this.tasks);
        this.render();
        this.lastDeletedTask = null;
      }
    });
  }

  startFocusOnTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.pomodoro.setFocusedTask(task);
    this.timerTaskLabel.textContent = `Focusing on: ${task.title}`;
    this.pomodoroPanel.classList.remove('collapsed');
    this.pomodoroPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this.pomodoro.setMode('focus');
    this.showToast(`🍅 Focus mode activated for: ${task.title}`);
  }

  openEditModal(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.editTaskId.value = task.id;
    this.editTaskTitle.value = task.title;
    this.editTaskCategory.value = task.category;
    this.editTaskPriority.value = task.priority;
    this.editTaskStatus.value = task.status || (task.completed ? 'done' : 'todo');
    this.editTaskRecurring.value = task.recurring || 'none';
    this.editTaskDue.value = task.dueDate || '';
    this.editTaskPomos.value = task.pomodoros || 1;
    this.editTaskTags.value = (task.tags || []).join(' ');
    this.editTaskNotes.value = task.notes || '';

    this.editModalBackdrop.classList.add('open');
  }

  closeEditModal() {
    this.editModalBackdrop.classList.remove('open');
  }

  handleSaveEdit() {
    const id = this.editTaskId.value;
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    task.title = this.editTaskTitle.value.trim();
    task.category = this.editTaskCategory.value;
    task.priority = this.editTaskPriority.value;
    task.status = this.editTaskStatus.value;
    task.completed = (task.status === 'done');
    task.recurring = this.editTaskRecurring.value;
    task.dueDate = this.editTaskDue.value;
    task.pomodoros = parseInt(this.editTaskPomos.value, 10) || 1;
    task.notes = this.editTaskNotes.value.trim();

    const tagsVal = this.editTaskTags.value.trim();
    task.tags = tagsVal ? tagsVal.split(/[\s,]+/).map(t => t.startsWith('#') ? t : `#${t}`) : [];

    StorageManager.saveTasks(this.tasks);
    this.closeEditModal();
    this.render();
    this.showToast('Task updated!');
  }

  openStatsModal() {
    const stats = StorageManager.getStats();
    const streak = StorageManager.getStreak();
    const history = StorageManager.getDailyHistory();

    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('stats-total-completed').textContent = stats.totalCompleted || completed;
    document.getElementById('stats-completion-rate').textContent = `${rate}%`;
    document.getElementById('stats-focus-minutes').textContent = `${stats.focusMinutes || 0}m`;
    document.getElementById('stats-current-streak').textContent = `${streak.count}🔥`;

    // Past 7 Days Weekly Activity Bar Chart
    const weeklyChartContainer = document.getElementById('weekly-bars-container');
    if (weeklyChartContainer) {
      const days = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let maxVal = 1;

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const val = history[iso] || 0;
        if (val > maxVal) maxVal = val;
        days.push({ dayName: dayNames[d.getDay()], count: val, iso });
      }

      weeklyChartContainer.innerHTML = days.map(d => {
        const pct = Math.max(8, Math.round((d.count / maxVal) * 100));
        return `
          <div class="weekly-bar-col">
            <span class="weekly-bar-val">${d.count > 0 ? d.count : ''}</span>
            <div class="weekly-bar-track">
              <div class="weekly-bar-fill" style="height: ${pct}%" title="${d.iso}: ${d.count} tasks"></div>
            </div>
            <span class="weekly-bar-day">${d.dayName}</span>
          </div>
        `;
      }).join('');
    }

    // Past 30 Days Heatmap Grid
    const heatmapGrid = document.getElementById('heatmap-grid');
    if (heatmapGrid) {
      const cells = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const val = history[iso] || 0;
        let lvl = 'l0';
        if (val >= 4) lvl = 'l3';
        else if (val >= 2) lvl = 'l2';
        else if (val >= 1) lvl = 'l1';

        cells.push(`<div class="h-cell ${lvl}" title="${iso}: ${val} completed"></div>`);
      }
      heatmapGrid.innerHTML = cells.join('');
    }

    // Category breakdown
    const catCounts = {};
    this.tasks.forEach(t => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });

    const catList = document.getElementById('category-bars-list');
    if (Object.keys(catCounts).length === 0) {
      catList.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;">No task categories logged yet.</p>';
    } else {
      catList.innerHTML = Object.entries(catCounts).map(([cat, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
          <div class="cat-bar-row">
            <div style="display:flex;justify-content:space-between;font-weight:600;">
              <span>${cat}</span>
              <span>${count} (${pct}%)</span>
            </div>
            <div class="cat-bar-track">
              <div class="cat-bar-fill" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    this.statsModalBackdrop.classList.add('open');
  }

  closeStatsModal() {
    this.statsModalBackdrop.classList.remove('open');
  }

  openSettingsModal() {
    this.settingsModalBackdrop.classList.add('open');
  }

  closeSettingsModal() {
    this.settingsModalBackdrop.classList.remove('open');
  }

  exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.tasks, null, 2));
    this.downloadFile(dataStr, `studyflow-backup-${new Date().toISOString().split('T')[0]}.json`);
    this.showToast('📥 JSON Backup downloaded!');
  }

  exportMarkdown() {
    let md = `# StudyFlow Pro — Task List (${new Date().toLocaleDateString()})\n\n`;
    const pending = this.tasks.filter(t => !t.completed);
    const completed = this.tasks.filter(t => t.completed);

    md += `## 📋 Active Tasks (${pending.length})\n`;
    pending.forEach(t => {
      md += `- [ ] **${t.title}** [${t.category}] (Priority: ${t.priority.toUpperCase()})${t.dueDate ? ` (Due: ${t.dueDate})` : ''}\n`;
      if (t.notes) md += `  - *Notes:* ${t.notes}\n`;
      if (t.subtasks && t.subtasks.length > 0) {
        t.subtasks.forEach(s => md += `    - [${s.done ? 'x' : ' '}] ${s.title}\n`);
      }
    });

    md += `\n## ✅ Completed Tasks (${completed.length})\n`;
    completed.forEach(t => {
      md += `- [x] ~~${t.title}~~ [${t.category}]\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    this.downloadFile(dataStr, `studyflow-tasks-${new Date().toISOString().split('T')[0]}.md`);
    this.showToast('📝 Markdown export downloaded!');
  }

  exportCSV() {
    const headers = ["Title", "Category", "Priority", "Status", "Due Date", "Pomodoros", "Tags", "Notes"];
    const rows = this.tasks.map(t => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.dueDate || ''}"`,
      t.pomodoros || 1,
      `"${(t.tags || []).join(', ')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, `studyflow-tasks-${new Date().toISOString().split('T')[0]}.csv`);
    this.showToast('📊 CSV export downloaded!');
  }

  downloadFile(uri, filename) {
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", uri);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        if (Array.isArray(importedTasks)) {
          this.tasks = importedTasks;
          StorageManager.saveTasks(this.tasks);
          this.closeSettingsModal();
          this.render();
          this.showToast('📤 Backup restored successfully!');
        } else {
          alert('Invalid backup file format');
        }
      } catch (err) {
        alert('Could not read backup file.');
      }
    };
    reader.readAsText(file);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  showUndoToast(message, undoCallback) {
    clearTimeout(this.undoTimeout);
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-undo-btn">Undo</button>
    `;

    toast.querySelector('.toast-undo-btn').addEventListener('click', () => {
      undoCallback();
      toast.remove();
    });

    this.toastContainer.appendChild(toast);
    this.undoTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  formatDueDate(dateStr) {
    if (!dateStr) return { text: '', isOverdue: false, isToday: false, isTomorrow: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue (${Math.abs(diffDays)}d)`, isOverdue: true, isToday: false, isTomorrow: false };
    } else if (diffDays === 0) {
      return { text: 'Due Today', isOverdue: false, isToday: true, isTomorrow: false };
    } else if (diffDays === 1) {
      return { text: 'Due Tomorrow', isOverdue: false, isToday: false, isTomorrow: true };
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return { text: `Due ${monthNames[due.getMonth()]} ${due.getDate()}`, isOverdue: false, isToday: false, isTomorrow: false };
    }
  }

  escapeHtml(str) {
    return (str || '')
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  render() {
    // 1. Calculate stats
    const total = this.tasks.length;
    const done = this.tasks.filter(t => t.completed).length;
    const remaining = total - done;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

    // Update Overview Card
    this.totalCountEl.textContent = total;
    this.doneCountEl.textContent = done;
    this.progressBarFill.style.width = `${percentage}%`;
    this.progressPercentageText.textContent = `${percentage}% completed`;
    this.remainingCountText.textContent = `${remaining} task${remaining === 1 ? '' : 's'} remaining`;

    const streak = StorageManager.getStreak();
    this.streakCountEl.textContent = streak.count;

    // 2. Filter & Sort tasks
    let filtered = [...this.tasks];

    if (this.currentSort === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      filtered.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));
    } else if (this.currentSort === 'dueDate') {
      filtered.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (this.currentSort === 'alpha') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (this.currentFilter === 'active') {
      filtered = filtered.filter(t => !t.completed);
    } else if (this.currentFilter === 'done') {
      filtered = filtered.filter(t => t.completed);
    } else if (this.currentFilter === 'high') {
      filtered = filtered.filter(t => t.priority === 'high');
    } else if (this.currentFilter === 'study') {
      filtered = filtered.filter(t => t.category === 'Study' || t.category === 'Exam');
    }

    if (this.searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(this.searchQuery) ||
        t.category.toLowerCase().includes(this.searchQuery) ||
        (t.notes && t.notes.toLowerCase().includes(this.searchQuery)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)))
      );
    }

    // 3. Render Empty State or Active View
    if (this.tasks.length === 0) {
      this.emptyStateCard.style.display = 'flex';
      this.taskList.style.display = 'none';
      this.kanbanView.style.display = 'none';
      this.matrixView.style.display = 'none';
      this.timelineView.style.display = 'none';
      return;
    }

    if (filtered.length === 0) {
      this.emptyStateCard.style.display = 'flex';
      this.emptyStateCard.querySelector('.empty-title').textContent = 'No matching tasks';
      this.emptyStateCard.querySelector('.empty-subtitle').textContent = 'Try clearing your search or filter';
      const presetPillWrap = this.emptyStateCard.querySelector('.empty-presets-row');
      if (presetPillWrap) presetPillWrap.style.display = 'none';
      this.taskList.style.display = 'none';
      this.kanbanView.style.display = 'none';
      this.matrixView.style.display = 'none';
      this.timelineView.style.display = 'none';
      return;
    }

    this.emptyStateCard.style.display = 'none';

    // Show appropriate active view
    this.taskList.style.display = (this.currentView === 'list') ? 'flex' : 'none';
    this.kanbanView.style.display = (this.currentView === 'kanban') ? 'grid' : 'none';
    this.matrixView.style.display = (this.currentView === 'matrix') ? 'grid' : 'none';
    this.timelineView.style.display = (this.currentView === 'timeline') ? 'flex' : 'none';

    if (this.currentView === 'list') {
      this.renderListView(filtered);
    } else if (this.currentView === 'kanban') {
      this.renderKanbanView(filtered);
    } else if (this.currentView === 'matrix') {
      this.renderMatrixView(filtered);
    } else if (this.currentView === 'timeline') {
      this.renderTimelineView(filtered);
    }
  }

  renderListView(filtered) {
    this.taskList.innerHTML = filtered.map(task => {
      const dueInfo = this.formatDueDate(task.dueDate);
      const subtasks = task.subtasks || [];
      const subtasksDone = subtasks.filter(s => s.done).length;
      const hasSubtasks = subtasks.length > 0;
      const tags = task.tags || [];

      return `
        <li class="task-item priority-${task.priority}-edge ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="task-item-main">
            <!-- Custom animated checkbox -->
            <button class="custom-checkbox" aria-label="Toggle completed" data-action="toggle-complete">
              <svg class="check-svg" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>

            <!-- Task text & meta badges -->
            <div class="task-details">
              <span class="task-title">${this.escapeHtml(task.title)}</span>
              
              <div class="task-meta-row">
                <span class="meta-pill category-pill">${this.escapeHtml(task.category)}</span>
                
                <span class="meta-pill priority-pill priority-${task.priority}">
                  ${task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Med' : '🟢 Normal'}
                </span>

                ${task.recurring && task.recurring !== 'none' ? `
                  <span class="meta-pill recurring-pill">
                    🔁 ${task.recurring.toUpperCase()}
                  </span>
                ` : ''}

                ${task.dueDate ? `
                  <span class="meta-pill due-pill ${dueInfo.isOverdue ? 'overdue' : ''}">
                    📅 ${dueInfo.text}
                  </span>
                ` : ''}

                ${task.pomodoros > 1 ? `
                  <span class="meta-pill" style="background:rgba(255,255,255,0.5)">
                    🍅 ${task.pomodoros} blocks
                  </span>
                ` : ''}

                ${tags.map(tag => `
                  <span class="meta-pill tag-pill">${this.escapeHtml(tag)}</span>
                `).join('')}

                ${hasSubtasks ? `
                  <button class="meta-pill subtask-badge-pill" data-action="toggle-subtasks-view" title="Click to view action steps">
                    📋 ${subtasksDone}/${subtasks.length} steps ▾
                  </button>
                ` : ''}

                ${task.notes ? `
                  <button class="meta-pill" data-action="toggle-notes-view" style="cursor:pointer;" title="Toggle study notes">
                    📝 Notes ▾
                  </button>
                ` : ''}
              </div>

              ${task.notes ? `
                <div class="task-notes-preview" id="notes-wrap-${task.id}" style="display: none;">
                  ${this.escapeHtml(task.notes)}
                </div>
              ` : ''}
            </div>

            <!-- Quick Action Buttons -->
            <div class="task-actions">
              <button class="action-icon-btn magic-step-btn" title="Add Magic AI steps" data-action="magic-steps">
                ✨
              </button>
              <button class="action-icon-btn pomo-target-btn" title="Focus Timer on this task" data-action="focus-task">
                🍅
              </button>
              <button class="action-icon-btn edit-btn" title="Edit Task" data-action="edit-task">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-icon-btn delete-btn" title="Delete Task" data-action="delete-task">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Subtasks breakdown container -->
          ${hasSubtasks ? `
            <div class="task-subtasks-wrapper" id="subtasks-wrap-${task.id}">
              ${subtasks.map(sub => `
                <div class="subtask-row ${sub.done ? 'sub-done' : ''}">
                  <button class="subtask-mini-check" data-action="toggle-subtask" data-sub-id="${sub.id}">
                    ${sub.done ? '✓' : ''}
                  </button>
                  <span>${this.escapeHtml(sub.title)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </li>
      `;
    }).join('');

    this.attachTaskListEvents(this.taskList);
  }

  renderKanbanView(filtered) {
    const todoTasks = filtered.filter(t => (t.status === 'todo' || (!t.status && !t.completed)));
    const inProgressTasks = filtered.filter(t => t.status === 'in-progress');
    const doneTasks = filtered.filter(t => t.status === 'done' || t.completed);

    document.getElementById('kanban-count-todo').textContent = todoTasks.length;
    document.getElementById('kanban-count-inprogress').textContent = inProgressTasks.length;
    document.getElementById('kanban-count-done').textContent = doneTasks.length;

    const renderCard = (t, nextStatus, nextLabel, prevStatus, prevLabel) => {
      const dueInfo = this.formatDueDate(t.dueDate);
      return `
        <div class="kanban-card priority-${t.priority}-edge" data-id="${t.id}">
          <span class="kanban-card-title">${this.escapeHtml(t.title)}</span>
          <div class="kanban-card-meta">
            <span class="meta-pill category-pill">${this.escapeHtml(t.category)}</span>
            <span class="meta-pill priority-pill priority-${t.priority}">
              ${t.priority === 'high' ? '🔴 High' : t.priority === 'medium' ? '🟡 Med' : '🟢 Low'}
            </span>
            ${t.dueDate ? `<span class="meta-pill due-pill ${dueInfo.isOverdue ? 'overdue' : ''}">📅 ${dueInfo.text}</span>` : ''}
            ${t.subtasks && t.subtasks.length > 0 ? `<span class="meta-pill">📋 ${t.subtasks.filter(s => s.done).length}/${t.subtasks.length}</span>` : ''}
          </div>
          <div class="kanban-card-actions">
            <div class="kanban-move-btns">
              ${prevStatus ? `<button class="kanban-shift-btn" data-shift-to="${prevStatus}">${prevLabel}</button>` : ''}
              ${nextStatus ? `<button class="kanban-shift-btn" data-shift-to="${nextStatus}">${nextLabel}</button>` : ''}
            </div>
            <button class="action-icon-btn pomo-target-btn" data-action="focus-task" title="Focus Timer">🍅</button>
          </div>
        </div>
      `;
    };

    document.getElementById('kanban-list-todo').innerHTML = todoTasks.map(t => renderCard(t, 'in-progress', 'Start ⚡', null, null)).join('');
    document.getElementById('kanban-list-inprogress').innerHTML = inProgressTasks.map(t => renderCard(t, 'done', 'Done ✅', 'todo', '◀ To Do')).join('');
    document.getElementById('kanban-list-done').innerHTML = doneTasks.map(t => renderCard(t, null, null, 'in-progress', '◀ In Progress')).join('');

    this.kanbanView.querySelectorAll('.kanban-card').forEach(card => {
      const taskId = card.dataset.id;
      card.querySelectorAll('[data-shift-to]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.shiftTaskStatus(taskId, btn.dataset.shiftTo);
        });
      });
      const focusBtn = card.querySelector('[data-action="focus-task"]');
      if (focusBtn) {
        focusBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.startFocusOnTask(taskId);
        });
      }
      card.addEventListener('click', () => this.openEditModal(taskId));
    });
  }

  renderMatrixView(filtered) {
    const q1 = [];
    const q2 = [];
    const q3 = [];
    const q4 = [];

    filtered.forEach(task => {
      const dueInfo = this.formatDueDate(task.dueDate);
      const isUrgent = dueInfo.isToday || dueInfo.isTomorrow || dueInfo.isOverdue;

      if (task.priority === 'high' && isUrgent) {
        q1.push(task);
      } else if (task.priority === 'high' || (task.priority === 'medium' && !isUrgent)) {
        q2.push(task);
      } else if (isUrgent) {
        q3.push(task);
      } else {
        q4.push(task);
      }
    });

    const renderMatrixItem = (t) => `
      <div class="kanban-card" data-id="${t.id}">
        <span class="kanban-card-title">${this.escapeHtml(t.title)}</span>
        <div class="kanban-card-meta">
          <span class="meta-pill category-pill">${this.escapeHtml(t.category)}</span>
          ${t.dueDate ? `<span class="meta-pill due-pill">📅 ${this.formatDueDate(t.dueDate).text}</span>` : ''}
        </div>
      </div>
    `;

    document.getElementById('matrix-list-q1').innerHTML = q1.length ? q1.map(renderMatrixItem).join('') : '<p style="color:var(--text-muted);font-size:0.75rem;">Clear!</p>';
    document.getElementById('matrix-list-q2').innerHTML = q2.length ? q2.map(renderMatrixItem).join('') : '<p style="color:var(--text-muted);font-size:0.75rem;">None scheduled.</p>';
    document.getElementById('matrix-list-q3').innerHTML = q3.length ? q3.map(renderMatrixItem).join('') : '<p style="color:var(--text-muted);font-size:0.75rem;">None.</p>';
    document.getElementById('matrix-list-q4').innerHTML = q4.length ? q4.map(renderMatrixItem).join('') : '<p style="color:var(--text-muted);font-size:0.75rem;">Empty.</p>';

    this.matrixView.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('click', () => this.openEditModal(card.dataset.id));
    });
  }

  renderTimelineView(filtered) {
    const overdue = [];
    const today = [];
    const tomorrow = [];
    const upcoming = [];
    const nodate = [];

    filtered.forEach(task => {
      if (!task.dueDate) {
        nodate.push(task);
        return;
      }
      const dueInfo = this.formatDueDate(task.dueDate);
      if (dueInfo.isOverdue) overdue.push(task);
      else if (dueInfo.isToday) today.push(task);
      else if (dueInfo.isTomorrow) tomorrow.push(task);
      else upcoming.push(task);
    });

    const renderItem = (t) => `
      <div class="kanban-card" data-id="${t.id}" style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span class="kanban-card-title" style="margin-bottom:2px;">${this.escapeHtml(t.title)}</span>
          <span class="meta-pill category-pill">${this.escapeHtml(t.category)}</span>
        </div>
        <button class="action-icon-btn pomo-target-btn" data-action="focus-task" title="Focus Timer">🍅</button>
      </div>
    `;

    const overdueGroup = document.getElementById('tl-group-overdue');
    overdueGroup.style.display = overdue.length ? 'block' : 'none';
    document.getElementById('tl-list-overdue').innerHTML = overdue.map(renderItem).join('');

    const todayGroup = document.getElementById('tl-group-today');
    todayGroup.style.display = today.length ? 'block' : 'none';
    document.getElementById('tl-list-today').innerHTML = today.map(renderItem).join('');

    const tomorrowGroup = document.getElementById('tl-group-tomorrow');
    tomorrowGroup.style.display = tomorrow.length ? 'block' : 'none';
    document.getElementById('tl-list-tomorrow').innerHTML = tomorrow.map(renderItem).join('');

    const upcomingGroup = document.getElementById('tl-group-upcoming');
    upcomingGroup.style.display = upcoming.length ? 'block' : 'none';
    document.getElementById('tl-list-upcoming').innerHTML = upcoming.map(renderItem).join('');

    const nodateGroup = document.getElementById('tl-group-nodate');
    nodateGroup.style.display = nodate.length ? 'block' : 'none';
    document.getElementById('tl-list-nodate').innerHTML = nodate.map(renderItem).join('');

    this.timelineView.querySelectorAll('.kanban-card').forEach(card => {
      const taskId = card.dataset.id;
      const focusBtn = card.querySelector('[data-action="focus-task"]');
      if (focusBtn) {
        focusBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.startFocusOnTask(taskId);
        });
      }
      card.addEventListener('click', () => this.openEditModal(taskId));
    });
  }

  attachTaskListEvents(container) {
    container.querySelectorAll('.task-item').forEach(item => {
      const taskId = item.dataset.id;

      item.querySelector('[data-action="toggle-complete"]').addEventListener('click', () => {
        this.toggleTaskCompletion(taskId);
      });

      item.querySelector('[data-action="delete-task"]').addEventListener('click', () => {
        this.deleteTask(taskId);
      });

      item.querySelector('[data-action="edit-task"]').addEventListener('click', () => {
        this.openEditModal(taskId);
      });

      item.querySelector('[data-action="focus-task"]').addEventListener('click', () => {
        this.startFocusOnTask(taskId);
      });

      const magicBtn = item.querySelector('[data-action="magic-steps"]');
      if (magicBtn) {
        magicBtn.addEventListener('click', () => {
          soundManager.playClickSound();
          const task = this.tasks.find(t => t.id === taskId);
          if (task) {
            const steps = SmartParser.generateMagicSubtasks(task.title, task.category);
            task.subtasks = [...(task.subtasks || []), ...steps];
            StorageManager.saveTasks(this.tasks);
            this.render();
            this.showToast(`✨ Generated ${steps.length} smart action steps!`);
          }
        });
      }

      const subtaskToggleBtn = item.querySelector('[data-action="toggle-subtasks-view"]');
      if (subtaskToggleBtn) {
        subtaskToggleBtn.addEventListener('click', () => {
          const wrap = item.querySelector(`#subtasks-wrap-${taskId}`);
          if (wrap) {
            wrap.style.display = wrap.style.display === 'none' ? 'flex' : 'none';
          }
        });
      }

      const notesToggleBtn = item.querySelector('[data-action="toggle-notes-view"]');
      if (notesToggleBtn) {
        notesToggleBtn.addEventListener('click', () => {
          const wrap = item.querySelector(`#notes-wrap-${taskId}`);
          if (wrap) {
            wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
          }
        });
      }

      item.querySelectorAll('[data-action="toggle-subtask"]').forEach(subBtn => {
        subBtn.addEventListener('click', () => {
          this.toggleSubtask(taskId, subBtn.dataset.subId);
        });
      });
    });
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new StudyFlowApp();
});
