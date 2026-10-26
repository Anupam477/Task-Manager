/**
 * StudyFlow Storage & State Management
 * Persistent storage in localStorage with streak calculation & preset templates
 */

const STORAGE_KEYS = {
  TASKS: 'studyflow_tasks',
  THEME: 'studyflow_theme',
  STATS: 'studyflow_stats',
  STREAK: 'studyflow_streak'
};

export const samplePresets = {
  exam: [
    {
      id: 'exam-1',
      title: 'Review Chapter 4 & 5 Core Formulae',
      category: 'Exam',
      priority: 'high',
      dueDate: new Date().toISOString().split('T')[0],
      pomodoros: 2,
      completed: false,
      createdAt: Date.now() - 3600000,
      subtasks: [
        { id: 'st-1', title: 'Derivation cheat sheet', done: true },
        { id: 'st-2', title: 'Solve 5 textbook practice problems', done: false }
      ]
    },
    {
      id: 'exam-2',
      title: 'Active Recall Flashcards (20 mins)',
      category: 'Study',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      pomodoros: 1,
      completed: false,
      createdAt: Date.now() - 7200000,
      subtasks: []
    },
    {
      id: 'exam-3',
      title: 'Past Year Question Paper Mock Test',
      category: 'Exam',
      priority: 'high',
      dueDate: '',
      pomodoros: 3,
      completed: false,
      createdAt: Date.now() - 10800000,
      subtasks: [
        { id: 'st-3', title: 'Section A - Multiple Choice', done: true },
        { id: 'st-4', title: 'Section B - Problem Solving', done: false }
      ]
    }
  ],
  coding: [
    {
      id: 'code-1',
      title: 'Implement Dark & Sky Glass Themes',
      category: 'Coding',
      priority: 'high',
      dueDate: new Date().toISOString().split('T')[0],
      pomodoros: 2,
      completed: true,
      createdAt: Date.now() - 5000000,
      subtasks: []
    },
    {
      id: 'code-2',
      title: 'Refactor Pomodoro Focus Timer Web Audio',
      category: 'Coding',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      pomodoros: 2,
      completed: false,
      createdAt: Date.now() - 2000000,
      subtasks: [
        { id: 'st-5', title: 'Synthesize chime sound', done: true },
        { id: 'st-6', title: 'Add rain noise generator', done: true }
      ]
    },
    {
      id: 'code-3',
      title: 'Optimize Responsive Mobile Breakpoints',
      category: 'Project',
      priority: 'low',
      dueDate: '',
      pomodoros: 1,
      completed: false,
      createdAt: Date.now() - 1000000,
      subtasks: []
    }
  ],
  daily: [
    {
      id: 'daily-1',
      title: 'Morning 30-min Deep Reading',
      category: 'Reading',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      pomodoros: 1,
      completed: false,
      createdAt: Date.now() - 4000000,
      subtasks: []
    },
    {
      id: 'daily-2',
      title: 'Review lecture notes & organize notebook',
      category: 'Study',
      priority: 'low',
      dueDate: new Date().toISOString().split('T')[0],
      pomodoros: 1,
      completed: false,
      createdAt: Date.now() - 3000000,
      subtasks: []
    },
    {
      id: 'daily-3',
      title: 'Mindfulness & Hydration Break',
      category: 'Personal',
      priority: 'low',
      dueDate: '',
      pomodoros: 1,
      completed: true,
      createdAt: Date.now() - 2000000,
      subtasks: []
    }
  ]
};

export class StorageManager {
  static getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read tasks:', e);
      return [];
    }
  }

  static saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      this.updateStreak();
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  }

  static getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'sky';
  }

  static saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  static getStreak() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (!data) return { count: 1, lastActiveDate: new Date().toDateString() };
      return JSON.parse(data);
    } catch (e) {
      return { count: 1, lastActiveDate: new Date().toDateString() };
    }
  }

  static updateStreak() {
    const today = new Date().toDateString();
    const streakData = this.getStreak();

    if (streakData.lastActiveDate === today) {
      return streakData.count;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (streakData.lastActiveDate === yesterday.toDateString()) {
      streakData.count += 1;
    } else {
      streakData.count = 1;
    }

    streakData.lastActiveDate = today;
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streakData));
    return streakData.count;
  }

  static getStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      return data ? JSON.parse(data) : { totalCompleted: 0, focusMinutes: 0 };
    } catch (e) {
      return { totalCompleted: 0, focusMinutes: 0 };
    }
  }

  static recordCompletedTask() {
    const stats = this.getStats();
    stats.totalCompleted = (stats.totalCompleted || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  static addFocusMinutes(minutes) {
    const stats = this.getStats();
    stats.focusMinutes = (stats.focusMinutes || 0) + minutes;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }
}
