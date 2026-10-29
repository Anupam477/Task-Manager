/**
 * StudyFlow Pro — Storage, Gamification & State Engine
 * LocalStorage persistence, RPG XP & Leveling, Achievement Badges, and Quick Scratchpad
 */

const STORAGE_KEYS = {
  TASKS: 'studyflow_tasks',
  THEME: 'studyflow_theme',
  STATS: 'studyflow_stats',
  STREAK: 'studyflow_streak',
  HISTORY: 'studyflow_daily_history',
  GAMIFICATION: 'studyflow_gamification',
  SCRATCHPAD: 'studyflow_scratchpad'
};

export const BADGE_DEFINITIONS = [
  { id: 'first_task', name: 'First Flow', icon: '🌟', desc: 'Completed your very first task', xp: 50 },
  { id: 'streak_3', name: 'Flame Keeper', icon: '🔥', desc: 'Maintained a 3-day task streak', xp: 150 },
  { id: 'pomo_master', name: 'Focus Titan', icon: '🍅', desc: 'Finished 3 full Pomodoro focus blocks', xp: 200 },
  { id: 'speed_demon', name: 'Momentum', icon: '⚡', desc: 'Completed 5 tasks in total', xp: 100 },
  { id: 'scholar', name: 'Scholar Pro', icon: '📚', desc: 'Completed 5 Study or Exam tasks', xp: 150 },
  { id: 'zen_master', name: 'Zen Mind', icon: '🧘', desc: 'Entered Fullscreen Zen Focus Mode', xp: 50 },
  { id: 'clean_slate', name: 'Total Victory', icon: '🏆', desc: 'Completed all active tasks in your list', xp: 250 }
];

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
      status: 'in-progress',
      notes: 'Focus on derivations and standard integrals. Check lecture slides 14-22.',
      tags: ['#exam', '#physics'],
      recurring: 'none',
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
      status: 'todo',
      notes: 'Use Leitner box app or physical cards for quick revision.',
      tags: ['#recall'],
      recurring: 'daily',
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
      status: 'todo',
      notes: 'Time test with 2.5 hour strict timer.',
      tags: ['#mock', '#prep'],
      recurring: 'none',
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
      status: 'done',
      notes: 'Fine-tune backdrop blur and saturated glass filters for high contrast.',
      tags: ['#css', '#ui'],
      recurring: 'none',
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
      status: 'in-progress',
      notes: 'Zero external MP3 dependencies - pure synthesized oscillators.',
      tags: ['#webaudio', '#js'],
      recurring: 'none',
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
      status: 'todo',
      notes: 'Ensure bottom sheet modals open smoothly with safe-area padding.',
      tags: ['#responsive'],
      recurring: 'none',
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
      status: 'in-progress',
      notes: 'Current book: Atomic Habits by James Clear.',
      tags: ['#habits', '#mindset'],
      recurring: 'daily',
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
      status: 'todo',
      notes: 'Consolidate highlights into Cornell notes template.',
      tags: ['#notes'],
      recurring: 'weekdays',
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
      status: 'done',
      notes: 'Drink 500ml water and 5 minutes box breathing.',
      tags: ['#wellness'],
      recurring: 'daily',
      createdAt: Date.now() - 2000000,
      subtasks: []
    }
  ]
};

export class StorageManager {
  static getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      const tasks = data ? JSON.parse(data) : [];
      return tasks.map(t => ({
        ...t,
        status: t.status || (t.completed ? 'done' : 'todo'),
        tags: Array.isArray(t.tags) ? t.tags : [],
        notes: t.notes || '',
        recurring: t.recurring || 'none'
      }));
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
    this.recordDailyCompletion();
  }

  static recordDailyCompletion() {
    try {
      const history = this.getDailyHistory();
      const todayIso = new Date().toISOString().split('T')[0];
      history[todayIso] = (history[todayIso] || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {}
  }

  static getDailyHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  static addFocusMinutes(minutes) {
    const stats = this.getStats();
    stats.focusMinutes = (stats.focusMinutes || 0) + minutes;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  /* ---------------- Gamification: XP, Levels & Badges ---------------- */

  static getGamification() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
      if (!data) {
        return { xp: 0, unlockedBadges: [], totalFocusSessions: 0 };
      }
      return JSON.parse(data);
    } catch (e) {
      return { xp: 0, unlockedBadges: [], totalFocusSessions: 0 };
    }
  }

  static addXP(amount) {
    const game = this.getGamification();
    const oldLevel = this.calculateLevel(game.xp).level;
    game.xp = (game.xp || 0) + amount;
    const newLevelInfo = this.calculateLevel(game.xp);

    localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(game));

    return {
      totalXP: game.xp,
      added: amount,
      levelUp: newLevelInfo.level > oldLevel,
      newLevel: newLevelInfo.level,
      title: newLevelInfo.title
    };
  }

  static calculateLevel(xp = 0) {
    const XP_PER_LEVEL = 200;
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const currentLevelBaseXP = (level - 1) * XP_PER_LEVEL;
    const currentProgress = xp - currentLevelBaseXP;
    const percentage = Math.min(100, Math.round((currentProgress / XP_PER_LEVEL) * 100));

    const titles = [
      'Novice Flow',
      'Focused Scholar',
      'Deep Worker',
      'Flow Practitioner',
      'Cognitive Master',
      'Focus Grandmaster',
      'Zenith Sovereign'
    ];
    const title = titles[Math.min(titles.length - 1, level - 1)];

    return {
      level,
      title,
      currentProgress,
      needed: XP_PER_LEVEL,
      percentage
    };
  }

  static unlockBadge(badgeId) {
    const game = this.getGamification();
    if (!game.unlockedBadges.includes(badgeId)) {
      game.unlockedBadges.push(badgeId);
      const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
      if (badgeDef) {
        game.xp = (game.xp || 0) + badgeDef.xp;
      }
      localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(game));
      return badgeDef || true;
    }
    return null;
  }

  static incrementFocusSession() {
    const game = this.getGamification();
    game.totalFocusSessions = (game.totalFocusSessions || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(game));
    return game.totalFocusSessions;
  }

  /* ---------------- Quick Scratchpad ---------------- */

  static getScratchpad() {
    return localStorage.getItem(STORAGE_KEYS.SCRATCHPAD) || '';
  }

  static saveScratchpad(text) {
    localStorage.setItem(STORAGE_KEYS.SCRATCHPAD, text);
  }
}
