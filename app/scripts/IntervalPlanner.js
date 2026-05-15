import Sortable from 'sortablejs';

class IntervalPlanner {
  constructor(elId, store) {
    this.el = document.getElementById(elId);
    this.store = store;
  }

  _uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  _pts(cards) {
    return cards.reduce((s, c) => s + (c.points || 0), 0);
  }

  _cardHtml(card) {
    return `<div class="planner-card${card.blocked ? ' is-blocked' : ''}" data-id="${this._esc(card.id)}">
      <div class="card-meta">
        <span class="card-type">${this._esc(card.type)}</span>
        <span class="card-points">${card.points > 0 ? card.points : '—'}</span>
      </div>
      <div class="card-title">${this._esc(card.title)}</div>
    </div>`;
  }

  _newIntervalForm() {
    return `<form class="add-card-form" id="new-interval-form">
      <input class="card-input" name="name" type="text" placeholder="Interval name" required autocomplete="off" />
      <div class="card-form-row">
        <input class="card-input" name="startDate" type="date" required />
        <input class="card-input" name="endDate" type="date" required />
      </div>
      <div class="card-form-actions">
        <button type="submit" class="card-form-btn primary">Create</button>
        <button type="button" class="card-form-btn" id="cancel-interval">Cancel</button>
      </div>
    </form>`;
  }

  render() {
    const data = this.store.load();
    const unassigned = data.cards.filter(c => !c.intervalId || c.status === 'backlog');

    const backlogHtml = `<div class="planner-backlog">
      <div class="board-col-head">
        <span class="col-label">Backlog</span>
        <span class="col-count">${unassigned.length}</span>
      </div>
      <div class="planner-cards" data-interval="">
        ${unassigned.map(c => this._cardHtml(c)).join('')}
      </div>
    </div>`;

    const lanesHtml = data.intervals.map(iv => {
      const cards = data.cards.filter(c => c.intervalId === iv.id && c.status !== 'backlog');
      return `<div class="planner-lane${iv.active ? ' is-active' : ''}">
        <div class="board-col-head">
          <span class="col-label">${this._esc(iv.name)}</span>
          <span class="col-count">${this._pts(cards)} pts · ${cards.length} cards</span>
        </div>
        <div class="planner-cards" data-interval="${this._esc(iv.id)}">
          ${cards.map(c => this._cardHtml(c)).join('')}
        </div>
      </div>`;
    }).join('');

    const emptyLanes = !data.intervals.length
      ? '<p class="empty-msg">No intervals yet — create one to start planning.</p>'
      : '';

    this.el.innerHTML = `<div class="planner-view">
      <div class="planner-toolbar">
        <h3 class="planner-heading">Interval Planner</h3>
        <button class="card-form-btn primary" id="show-new-interval">+ New Interval</button>
      </div>
      <div id="new-interval-area"></div>
      <div class="planner-board">
        ${backlogHtml}
        <div class="planner-lanes">${lanesHtml}${emptyLanes}</div>
      </div>
    </div>`;

    this._bind();
    this._initSortable();
  }

  _bind() {
    const showBtn = this.el.querySelector('#show-new-interval');
    const area = this.el.querySelector('#new-interval-area');
    showBtn.addEventListener('click', () => {
      if (area.innerHTML) { area.innerHTML = ''; return; }
      area.innerHTML = this._newIntervalForm();
      area.querySelector('[name="name"]').focus();
      area.querySelector('#cancel-interval').addEventListener('click', () => { area.innerHTML = ''; });
      area.querySelector('#new-interval-form').addEventListener('submit', e => {
        e.preventDefault();
        this._addInterval(e.target);
      });
    });
  }

  _addInterval(form) {
    const data = this.store.load();
    const isFirst = data.intervals.length === 0;
    data.intervals.push({
      id: this._uid(),
      name: form.name.value.trim(),
      startDate: form.startDate.value,
      endDate: form.endDate.value,
      active: isFirst
    });
    this.store.save(data);
    this.render();
  }

  _initSortable() {
    this.el.querySelectorAll('.planner-cards').forEach(list => {
      Sortable.create(list, {
        group: 'planner',
        animation: 150,
        ghostClass: 'card-ghost',
        onEnd: evt => {
          const id = evt.item.dataset.id;
          const newIntervalId = evt.to.dataset.interval || null;
          const d = this.store.load();
          const card = d.cards.find(c => c.id === id);
          if (!card) return;
          card.intervalId = newIntervalId || null;
          if (!newIntervalId) card.status = 'backlog';
          this.store.save(d);
          this.render();
        }
      });
    });
  }
}

export default IntervalPlanner;
