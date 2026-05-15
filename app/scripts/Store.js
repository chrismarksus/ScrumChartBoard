class Store {
  constructor(team, project) {
    this._key = `scrum_board_${team}_${project}`;
    this.apiBase = null;
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this._key)) || this._empty();
    } catch(e) {
      return this._empty();
    }
  }

  save(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
    if (this.apiBase) {
      fetch(`${this.apiBase}/board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(() => {});
    }
  }

  _empty() {
    return { cards: [], intervals: [], timelines: [] };
  }
}

export default Store;
