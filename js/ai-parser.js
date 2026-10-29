/**
 * StudyFlow Pro — Smart NLP Parser & AI Task Breakdown Engine
 * Client-side heuristic intelligence for natural language parsing and instant subtask generation
 */

export class SmartParser {
  /**
   * Parse quick syntax like:
   * "Solve Calculus Ch 3 problems tomorrow !high @Study #exam 2pomo"
   */
  static parse(input) {
    let text = input.trim();
    let priority = null;
    let category = null;
    let dueDate = null;
    let pomodoros = null;
    const tags = [];

    // 1. Priority parsing: !high, !urgent, !med, !low
    if (/!(high|urgent|top)/i.test(text)) {
      priority = 'high';
      text = text.replace(/!(high|urgent|top)/i, '');
    } else if (/!(med|medium|normal)/i.test(text)) {
      priority = 'medium';
      text = text.replace(/!(med|medium|normal)/i, '');
    } else if (/!(low)/i.test(text)) {
      priority = 'low';
      text = text.replace(/!(low)/i, '');
    }

    // 2. Category parsing: @study, @coding, @project, @exam, @reading, @personal
    const catMatch = text.match(/@(study|coding|project|exam|reading|personal)/i);
    if (catMatch) {
      const c = catMatch[1].toLowerCase();
      const catMap = {
        study: 'Study',
        coding: 'Coding',
        project: 'Project',
        exam: 'Exam',
        reading: 'Reading',
        personal: 'Personal'
      };
      category = catMap[c] || 'Study';
      text = text.replace(catMatch[0], '');
    }

    // 3. Tags: #tag1 #tag2
    const tagMatches = text.match(/#([a-zA-Z0-9_\-]+)/g);
    if (tagMatches) {
      tagMatches.forEach(t => {
        tags.push(t.toLowerCase());
        text = text.replace(t, '');
      });
    }

    // 4. Pomodoro estimate: 2pomo, 3p, 4blocks
    const pomoMatch = text.match(/\b([1-8])\s*(pomo|pomos|pomodoro|p|blocks?)\b/i);
    if (pomoMatch) {
      pomodoros = parseInt(pomoMatch[1], 10);
      text = text.replace(pomoMatch[0], '');
    }

    // 5. Date Parsing: today, tomorrow, aaj, kal, in X days, weekday
    const today = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (/\b(today|aaj)\b/i.test(text)) {
      dueDate = formatDate(today);
      text = text.replace(/\b(today|aaj)\b/i, '');
    } else if (/\b(tomorrow|kal)\b/i.test(text)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      dueDate = formatDate(tomorrow);
      text = text.replace(/\b(tomorrow|kal)\b/i, '');
    } else {
      const inDaysMatch = text.match(/\bin\s+(\d+)\s+days?\b/i);
      if (inDaysMatch) {
        const target = new Date(today);
        target.setDate(today.getDate() + parseInt(inDaysMatch[1], 10));
        dueDate = formatDate(target);
        text = text.replace(inDaysMatch[0], '');
      } else {
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        for (let i = 0; i < 7; i++) {
          const re = new RegExp(`\\b(next\\s+)?${daysOfWeek[i]}\\b`, 'i');
          if (re.test(text)) {
            const currentDay = today.getDay();
            let diff = i - currentDay;
            if (diff <= 0) diff += 7;
            const target = new Date(today);
            target.setDate(today.getDate() + diff);
            dueDate = formatDate(target);
            text = text.replace(re, '');
            break;
          }
        }
      }
    }

    // Clean whitespace
    const cleanTitle = text.replace(/\s+/g, ' ').trim();

    return {
      title: cleanTitle || input.trim(),
      priority: priority || 'medium',
      category: category || 'Study',
      dueDate: dueDate || '',
      pomodoros: pomodoros || 1,
      tags
    };
  }

  /**
   * Generates intelligent, structured breakdown subtasks based on keywords
   */
  static generateMagicSubtasks(title, category = 'Study') {
    const lower = (title || '').toLowerCase();

    // 1. Exam & Test preparation
    if (lower.includes('exam') || lower.includes('test') || lower.includes('quiz') || lower.includes('revision') || lower.includes('mock') || category === 'Exam') {
      return [
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Gather syllabus & highlight high-weight topics', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Prepare quick formula & keyword summary sheet', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Solve 5-10 past year sample questions', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Review incorrect solutions and repeat active recall', done: false }
      ];
    }

    // 2. Coding, Software & Web development
    if (lower.includes('code') || lower.includes('bug') || lower.includes('build') || lower.includes('api') || lower.includes('app') || lower.includes('feature') || category === 'Coding') {
      return [
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Plan component architecture & state requirements', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Implement core functionality & error handling', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Refine UI styles, accessibility & responsiveness', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Run manual checks & test edge cases', done: false }
      ];
    }

    // 3. Essay, Assignment, Paper & Report
    if (lower.includes('essay') || lower.includes('report') || lower.includes('assignment') || lower.includes('paper') || lower.includes('write')) {
      return [
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Formulate thesis statement and research references', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Structure detailed bulleted section outline', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Draft body paragraphs with supporting evidence', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Proofread flow, grammar, and format citations', done: false }
      ];
    }

    // 4. Presentation & Slides
    if (lower.includes('presentation') || lower.includes('slide') || lower.includes('pitch') || lower.includes('demo') || lower.includes('talk')) {
      return [
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Define key message & 3 core takeaways', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Draft clean slides with diagrams and minimal text', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Prepare speaker talking points & backup answers', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Full rehearsal with 15-minute stopwatch', done: false }
      ];
    }

    // 5. Reading & Literature
    if (lower.includes('read') || lower.includes('book') || lower.includes('chapter') || category === 'Reading') {
      return [
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Preview chapter headings, charts & summary', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Deep reading session with margin annotations', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Extract 3 practical action insights to notes', done: false }
      ];
    }

    // 6. Workout, Fitness & Health
    if (lower.includes('workout') || lower.includes('gym') || lower.includes('run') || lower.includes('exercise') || lower.includes('yoga')) {
      return [
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: '5-minute dynamic joint mobility warmup', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Complete targeted sets with controlled form', done: false },
        { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Cool-down stretching and hydrate with water', done: false }
      ];
    }

    // 7. General smart task decomposition
    return [
      { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Define end goal & assemble required materials', done: false },
      { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Execute primary 25-minute focused milestone', done: false },
      { id: 'st-' + Math.random().toString(36).substr(2, 5), title: 'Review results, polish details & mark complete', done: false }
    ];
  }
}

