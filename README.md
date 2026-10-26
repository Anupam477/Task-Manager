# StudyFlow Pro — Aesthetic Glassmorphic Task & Study Suite ✨

StudyFlow Pro is a modern, glassmorphic productivity web application designed to help students and developers stay in the flow state. It integrates a **Pomodoro Focus Timer**, **Ambient Focus Sounds**, **Subtask breakdowns**, and **Productivity Analytics** with 9 curated themes and a mobile-first responsive design.

---

## 🚀 Features

- **💎 Frosted Glassmorphism Design System**: Modern visual aesthetics with dynamic ambient mesh lighting and smooth micro-animations.
- **📱 Mobile-First Responsive**: Custom touch targets, native iOS/Android style bottom sheets, and notch/safe-area optimization.
- **🎨 9 Curated Aesthetic Themes**:
  - Sky Mist (Default)
  - Midnight Glass (Dark Obsidian)
  - Tokyo Cyber (Neon Synthwave)
  - Cozy Latte (Warm Minimalist)
  - Peach Sunset (Vibrant Gradient)
  - Arctic Frost (Cool Cyan)
  - Sakura Bloom (Soft Pastel Pink)
  - Emerald Zen (Nature Calm)
  - OLED Carbon (Pure Deep Black)
- **🍅 Integrated Pomodoro Timer**: Study (25m), Short Break (5m), and Long Break (15m) sessions with session celebration confetti.
- **🎧 Ambient Soundscapes**: Rain, Ocean Waves, and Focus Noise with dedicated volume control and equalizer indicator.
- **📋 Subtasks & Priority Filtering**: Break down complex tasks into checkable steps, filter by urgency (High, Medium, Normal) or category (Study, Coding, Project, Exam Prep, Reading, Personal).
- **📊 Productivity Insights**: Live efficiency rates, streak counters, focus minutes, and categorical task distributions.
- **💾 100% Private & Local Storage**: No database or login required. Includes full JSON export and restore backups.

---

## 🛠️ Tech Stack

- **HTML5 & Vanilla JavaScript (ES6 Modules)**: Fast, lightweight, zero-bloat architecture.
- **Pure Modern CSS**: Custom properties (CSS variables), glassmorphism filters, clamp typography, and responsive media queries.
- **Vite**: Ultra-fast local development server and optimized production bundler.

---

## 💻 Quick Start & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/studyflow-task-manager.git
cd studyflow-task-manager
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 📂 Project Structure

```text
Task-Manager/
├── css/
│   └── style.css          # Design system, glassmorphism tokens & mobile responsive styles
├── js/
│   ├── app.js             # Main application controller & UI interactions
│   ├── audio.js           # Ambient sound engine & audio synthesizer
│   ├── confetti.js        # Canvas confetti celebrations
│   ├── pomodoro.js        # Pomodoro timer state engine
│   └── storage.js         # LocalStorage persistence & template presets
├── index.html             # Main entry document
├── package.json           # Project metadata & scripts
├── package-lock.json      # Dependency lockfile
├── .gitignore             # Files excluded from git
└── README.md              # Project documentation
```

---

## 📄 License

MIT License — feel free to use, modify, and build upon this project.
