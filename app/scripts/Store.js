export default class Store {
  constructor(team, project) {
    this._team = team;
    this._project = project;
    this._key = `scrum_board_${team}_${project}`;
    this._data = this._load();
  }

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this._key)) || { cards: [], intervals: [], timelines: [] };
    } catch(e) {
      return { cards: [], intervals: [], timelines: [] };
    }
  }

  _boardUrl() {
    return `${Store.apiBase}/board?team=${encodeURIComponent(this._team)}&project=${encodeURIComponent(this._project)}`;
  }

  _save() {
    localStorage.setItem(this._key, JSON.stringify(this._data));
    if (Store.apiBase) {
      fetch(this._boardUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this._data)
      }).catch(() => {});
    }
  }

  async sync() {
    if (!Store.apiBase) return;
    try {
      const res = await fetch(this._boardUrl());
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.cards) && Array.isArray(data.intervals) && Array.isArray(data.timelines)) {
        this._data = data;
        localStorage.setItem(this._key, JSON.stringify(this._data));
      }
    } catch {
      // network unavailable — keep localStorage state
    }
  }

  getCards() { return [...this._data.cards]; }

  addCard(attrs) {
    const card = Object.assign({ id: crypto.randomUUID(), status: 'backlog', blocked: false, intervalId: null }, attrs);
    this._data.cards.push(card);
    this._save();
    return card;
  }

  updateCard(id, patch) {
    const card = this._data.cards.find(c => c.id === id);
    if (card) { Object.assign(card, patch); this._save(); }
  }

  removeCard(id) {
    this._data.cards = this._data.cards.filter(c => c.id !== id);
    this._save();
  }

  getIntervals() { return [...this._data.intervals]; }

  addInterval(attrs) {
    const interval = Object.assign({ id: crypto.randomUUID(), active: false }, attrs);
    this._data.intervals.push(interval);
    this._save();
    return interval;
  }

  updateInterval(id, patch) {
    const interval = this._data.intervals.find(iv => iv.id === id);
    if (interval) { Object.assign(interval, patch); this._save(); }
  }

  removeInterval(id) {
    this._data.intervals = this._data.intervals.filter(iv => iv.id !== id);
    this._save();
  }

  getTimelines() { return [...this._data.timelines]; }

  addTimeline(attrs) {
    const timeline = Object.assign({ id: crypto.randomUUID(), status: 'todo', intervalStart: 0, intervalEnd: 0 }, attrs);
    this._data.timelines.push(timeline);
    this._save();
    return timeline;
  }

  updateTimeline(id, patch) {
    const timeline = this._data.timelines.find(t => t.id === id);
    if (timeline) { Object.assign(timeline, patch); this._save(); }
  }

  removeTimeline(id) {
    this._data.timelines = this._data.timelines.filter(t => t.id !== id);
    this._save();
  }

  /**
   * Import full state for roundtrip (e.g. from exported board-full-state.json).
   * Replaces current cards, intervals, timelines.
   */
  importState(data) {
    if (data && Array.isArray(data.cards) && Array.isArray(data.intervals) && Array.isArray(data.timelines)) {
      this._data = {
        cards: data.cards,
        intervals: data.intervals,
        timelines: data.timelines
      };
      this._save();
    }
  }
}

Store.apiBase = null;
