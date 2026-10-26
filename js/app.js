/**
 * StudyFlow Pro — Main Application Driver
 */

import { soundManager } from './audio.js';
import { triggerConfetti } from './confetti.js';
import { StorageManager, samplePresets } from './storage.js';
import { PomodoroTimer } from './pomodoro.js';

class StudyFlowApp {
  constructor() {
    this.tasks = StorageManager.getTasks();
    this.currentFilter = 'all';
    this.currentSort = 'default';
    this.searchQuery = '';
    this.drawerSubtasks = [];
    this.lastDeletedTask = null;
    this.undoTimeout = null;

    this.initDOM();
    this.initDate();
    this.initTheme();
    this.initPomodoro();
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

    // Input & Drawer
    this.taskInput = document.getElementById('new-task-input');
    this.addTaskBtn = document.getElementById('add-task-btn');
    this.advancedToggleBtn = document.getElementById('advanced-toggle-btn');
    this.advancedDrawer = document.getElementById('advanced-drawer');
    this.categorySelect = document.getElementById('task-category-select');
    this.prioritySelect = document.getElementById('task-priority-select');
    this.dueDateInput = document.getElementById('task-due-date');
    this.pomoStepVal = document.getElementById('pomo-step-val');
    this.pomoStepDec = document.getElementById('pomo-step-dec');
    this.pomoStepInc = document.getElementById('pomo-step-inc');
    this.drawerSubtaskInput = document.getElementById('drawer-subtask-input');
    this.drawerAddSubtaskBtn = document.getElementById('drawer-add-subtask-btn');
    this.drawerSubtaskList = document.getElementById('drawer-subtask-list');

    // Search, Filter & Sort
    this.searchInput = document.getElementById('search-tasks-input');
    this.clearSearchBtn = document.getElementById('clear-search-btn');
    this.filterPills = document.querySelectorAll('.filter-pill');
    this.sortSelect = document.getElementById('sort-tasks-select');

    // List & Empty state
    this.taskList = document.getElementById('task-list');
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
    this.editTaskDue = document.getElementById('edit-task-due');
    this.editTaskPomos = document.getElementById('edit-task-pomos');

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
        this.timerDisplay.textContent = formattedTime;
        document.title = `(${formattedTime}) StudyFlow`;
      },
      (mode, task) => {
        document.title = 'StudyFlow — Advanced Frosted Glass Task & Study Suite';
        const title = mode === 'focus' ? '🎉 Focus Session Completed!' : '☕ Break Finished!';
        const body = task ? `Finished session for: ${task.title}` : 'Ready for the next session!';
        this.showToast(title);
        triggerConfetti();
      }
    );

    this.timerToggleBtn.addEventListener('click', () => {
      const isRunning = this.pomodoro.toggle();
      this.timerToggleBtn.textContent = isRunning ? 'Pause' : 'Resume';
      this.timerToggleBtn.classList.toggle('active', isRunning);
      if (!isRunning) {
        document.title = 'StudyFlow — Advanced Frosted Glass Task & Study Suite';
      }
    });

    this.timerResetBtn.addEventListener('click', () => {
      this.pomodoro.reset();
      this.timerToggleBtn.textContent = 'Start Focus';
      this.timerToggleBtn.classList.remove('active');
      document.title = 'StudyFlow — Advanced Frosted Glass Task & Study Suite';
    });

    this.pomoTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.pomoTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.pomodoro.setMode(tab.dataset.mode);
        this.timerToggleBtn.textContent = 'Start ' + (tab.dataset.mode === 'focus' ? 'Focus' : 'Break');
        this.timerToggleBtn.classList.remove('active');
      });
    });

    this.pomodoroToggleBtn.addEventListener('click', () => {
      this.pomodoroPanel.classList.toggle('collapsed');
      if (!this.pomodoroPanel.classList.contains('collapsed')) {
        this.pomodoroPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    this.pomoCloseBtn.addEventListener('click', () => {
      this.pomodoroPanel.classList.add('collapsed');
    });
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
      const isCollapsed = this.advancedDrawer.classList.toggle('collapsed');
      this.advancedToggleBtn.classList.toggle('active', !isCollapsed);
    });

    // Pomodoro stepper in drawer
    let currentPomos = 1;
    this.pomoStepInc.addEventListener('click', () => {
      if (currentPomos < 8) currentPomos++;
      this.pomoStepVal.textContent = currentPomos;
    });
    this.pomoStepDec.addEventListener('click', () => {
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
        this.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentFilter = pill.dataset.filter;
        this.render();
      });
    });

    // Empty state load preset button
    this.loadSampleBtn.addEventListener('click', () => {
      this.tasks = [...samplePresets.exam];
      StorageManager.saveTasks(this.tasks);
      this.showToast('✨ Study sprint template loaded!');
      this.render();
    });

    // Quick empty state preset pills
    document.querySelectorAll('[data-preset-quick]').forEach(btn => {
      btn.addEventListener('click', () => {
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
      this.soundDropdown.classList.toggle('open');
      this.themeDropdown.classList.remove('open');
    });

    this.soundOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        this.soundOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const soundType = opt.dataset.sound;
        soundManager.startAmbient(soundType);

        if (soundType !== 'off') {
          if (this.soundEqualizer) this.soundEqualizer.style.display = 'inline-flex';
        } else {
          if (this.soundEqualizer) this.soundEqualizer.style.display = 'none';
        }

        const labels = { off: 'Sound', rain: 'Rain 🌧️', waves: 'Waves 🌊', brown: 'Noise ☕' };
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
      this.themeDropdown.classList.toggle('open');
      this.soundDropdown.classList.remove('open');
    });

    this.themeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
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
    this.statsToggleBtn.addEventListener('click', () => this.openStatsModal());
    this.statsCloseBtn.addEventListener('click', () => this.closeStatsModal());
    this.statsModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.statsModalBackdrop) this.closeStatsModal();
    });

    // Settings Modal
    this.settingsBtn.addEventListener('click', () => this.openSettingsModal());
    this.settingsCloseBtn.addEventListener('click', () => this.closeSettingsModal());
    this.settingsModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.settingsModalBackdrop) this.closeSettingsModal();
    });

    // Backup Export / Import / Clear
    document.getElementById('export-data-btn').addEventListener('click', () => this.exportBackup());
    document.getElementById('import-data-input').addEventListener('change', (e) => this.importBackup(e));
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
      if (e.key === '/' && document.activeElement !== this.taskInput && document.activeElement !== this.searchInput) {
        e.preventDefault();
        this.searchInput.focus();
      } else if (e.key === 'Escape') {
        this.closeEditModal();
        this.closeStatsModal();
        this.closeSettingsModal();
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
    const title = this.taskInput.value.trim();
    if (!title) return;

    const newTask = {
      id: 'task-' + Date.now(),
      title,
      category: this.categorySelect.value || 'Study',
      priority: this.prioritySelect.value || 'medium',
      dueDate: this.dueDateInput.value || '',
      pomodoros: parseInt(this.pomoStepVal.textContent, 10) || 1,
      completed: false,
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

    this.render();
    this.showToast('Task added successfully!');
  }

  toggleTaskCompletion(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    if (task.completed) {
      soundManager.playCompletionChime();
      StorageManager.recordCompletedTask();

      // Check if all tasks are done
      const allDone = this.tasks.length > 0 && this.tasks.every(t => t.completed);
      if (allDone) {
        triggerConfetti();
        this.showToast('🎉 All tasks completed! Amazing work!');
      } else {
        triggerConfetti();
      }
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
    this.editTaskDue.value = task.dueDate || '';
    this.editTaskPomos.value = task.pomodoros || 1;

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
    task.dueDate = this.editTaskDue.value;
    task.pomodoros = parseInt(this.editTaskPomos.value, 10) || 1;

    StorageManager.saveTasks(this.tasks);
    this.closeEditModal();
    this.render();
    this.showToast('Task updated!');
  }

  openStatsModal() {
    const stats = StorageManager.getStats();
    const streak = StorageManager.getStreak();

    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('stats-total-completed').textContent = stats.totalCompleted || completed;
    document.getElementById('stats-completion-rate').textContent = `${rate}%`;
    document.getElementById('stats-focus-minutes').textContent = `${stats.focusMinutes || 0}m`;
    document.getElementById('stats-current-streak').textContent = `${streak.count}🔥`;

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
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `studyflow-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('📥 Backup downloaded!');
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
    if (!dateStr) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue (${Math.abs(diffDays)}d)`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due Today', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Due Tomorrow', isOverdue: false };
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return { text: `Due ${monthNames[due.getMonth()]} ${due.getDate()}`, isOverdue: false };
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

    // Update Overview Card (matches screenshot)
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
        t.category.toLowerCase().includes(this.searchQuery)
      );
    }

    // 3. Render Empty State or List
    if (this.tasks.length === 0) {
      this.emptyStateCard.style.display = 'flex';
      this.taskList.style.display = 'none';
      return;
    }

    if (filtered.length === 0) {
      this.emptyStateCard.style.display = 'flex';
      this.emptyStateCard.querySelector('.empty-title').textContent = 'No matching tasks';
      this.emptyStateCard.querySelector('.empty-subtitle').textContent = 'Try clearing your search or filter';
      const presetPillWrap = this.emptyStateCard.querySelector('.empty-presets-row');
      if (presetPillWrap) presetPillWrap.style.display = 'none';
      this.taskList.style.display = 'none';
      return;
    }

    this.emptyStateCard.style.display = 'none';
    this.taskList.style.display = 'flex';

    this.taskList.innerHTML = filtered.map(task => {
      const dueInfo = this.formatDueDate(task.dueDate);
      const subtasks = task.subtasks || [];
      const subtasksDone = subtasks.filter(s => s.done).length;
      const hasSubtasks = subtasks.length > 0;

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

                ${hasSubtasks ? `
                  <button class="meta-pill subtask-badge-pill" data-action="toggle-subtasks-view" title="Click to expand/collapse steps">
                    📋 ${subtasksDone}/${subtasks.length} steps ▾
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div class="task-actions">
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

    // Attach dynamic click handlers to task list items
    this.taskList.querySelectorAll('.task-item').forEach(item => {
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

      // Subtasks toggle accordion
      const subtaskToggleBtn = item.querySelector('[data-action="toggle-subtasks-view"]');
      if (subtaskToggleBtn) {
        subtaskToggleBtn.addEventListener('click', () => {
          const wrap = item.querySelector(`#subtasks-wrap-${taskId}`);
          if (wrap) {
            wrap.style.display = wrap.style.display === 'none' ? 'flex' : 'none';
          }
        });
      }

      // Subtask checks
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
