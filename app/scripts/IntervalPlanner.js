import Sortable from 'sortablejs';

export default class IntervalPlanner {
  constructor(store) {
    this._store = store;
    this._sortables = [];
    this._showForm = false;
  }

  render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = this._html();
    this._bind(el);
    this._initSortable(el);
  }

  _html() {
    const intervals = this._store.getIntervals();
    const unassigned = this._store.getCards().filter(c => c.status === 'backlog' && !c.intervalId);
    return `<div class="planner-wrap shell">
      <div class="planner-header">
        <span class="planner-title">Interval Planner</span>
        <button class="planner-new-btn">+ New Interval</button>
      </div>
      ${this._showForm ? this._formHtml() : ''}
      <div class="planner-layout">
        <div class="planner-unassigned">
          <div class="planner-col-header">
            <span>Unassigned</span>
            <span class="planner-col-count">${unassigned.length}</span>
          </div>
          <div class="planner-drop-zone" data-interval-id="">
            ${unassigned.map(c => this._cardHtml(c)).join('')}
          </div>
        </div>
        <div class="planner-lanes">
          ${intervals.length
            ? intervals.map(iv => this._laneHtml(iv)).join('')
            : '<p class="planner-empty">No intervals yet — click <strong>+ New Interval</strong> to create one.</p>'
          }
        </div>
      </div>
    </div>`;
  }

  _formHtml() {
    return `<form class="planner-new-form" autocomplete="off">
      <input class="planner-f-name" type="text" placeholder="Interval name" required>
      <input class="planner-f-start" type="date" title="Start date">
      <input class="planner-f-end" type="date" title="End date">
      <button type="submit" class="planner-f-submit">Create</button>
      <button type="button" class="planner-f-cancel">Cancel</button>
    </form>`;
  }

  _laneHtml(iv) {
    const cards = this._store.getCards().filter(c => c.intervalId === iv.id);
    const pts = cards.reduce((s, c) => s + (c.points || 0), 0);
    return `<div class="planner-lane${iv.active ? ' is-active' : ''}">
      <div class="planner-lane-header">
        <span class="planner-lane-name">${this._esc(iv.name)}</span>
        ${iv.startDate ? `<span class="planner-lane-dates">${iv.startDate} – ${iv.endDate || ''}</span>` : ''}
        <span class="planner-lane-pts">${pts} pts</span>
        <button class="planner-active-btn${iv.active ? ' is-active' : ''}" data-id="${iv.id}">${iv.active ? 'Active ✓' : 'Set active'}</button>
        <button class="planner-del-lane" data-id="${iv.id}">×</button>
      </div>
      <div class="planner-drop-zone" data-interval-id="${iv.id}">
        ${cards.map(c => this._cardHtml(c)).join('')}
      </div>
    </div>`;
  }

  _cardHtml(card) {
    return `<div class="board-card${card.blocked ? ' is-blocked' : ''}" data-id="${card.id}">
      <div class="board-card-header">
        <span class="board-card-type">${card.type || 'Story'}</span>
        ${card.points ? `<span class="board-card-points">${card.points}</span>` : ''}
      </div>
      <div class="board-card-title">${this._esc(card.title)}</div>
    </div>`;
  }

  _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  _bind(el) {
    el.querySelector('.planner-new-btn').addEventListener('click', () => {
      this._showForm = !this._showForm;
      this.render(el.id);
    });

    const form = el.querySelector('.planner-new-form');
    if (form) {
      form.querySelector('.planner-f-cancel').addEventListener('click', () => {
        this._showForm = false;
        this.render(el.id);
      });
      form.addEventListener('submit', e => {
        e.preventDefault();
        const name = el.querySelector('.planner-f-name').value.trim();
        if (!name) return;
        this._store.addInterval({
          name,
          startDate: el.querySelector('.planner-f-start').value,
          endDate: el.querySelector('.planner-f-end').value
        });
        this._showForm = false;
        this.render(el.id);
      });
    }

    el.querySelectorAll('.planner-active-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.target.dataset.id;
        this._store.getIntervals().forEach(iv => {
          this._store.updateInterval(iv.id, { active: iv.id === id });
        });
        this.render(el.id);
      });
    });

    el.querySelectorAll('.planner-del-lane').forEach(btn => {
      btn.addEventListener('click', e => {
        if (typeof confirm === 'function' && !confirm('Delete this interval and unassign its cards?')) return;
        const id = e.target.dataset.id;
        this._store.getCards()
          .filter(c => c.intervalId === id)
          .forEach(c => this._store.updateCard(c.id, { intervalId: null }));
        this._store.removeInterval(id);
        this.render(el.id);
      });
    });
  }

  _initSortable(el) {
    this._sortables.forEach(s => s.destroy());
    this._sortables = [];
    el.querySelectorAll('.planner-drop-zone').forEach(zone => {
      this._sortables.push(new Sortable(zone, {
        group: 'planner',
        animation: 150,
        ghostClass: 'board-card-ghost',
        onEnd: evt => {
          const id = evt.item.dataset.id;
          const intervalId = evt.to.dataset.intervalId || null;
          this._store.updateCard(id, { intervalId });
          this.render(el.id);
        }
      }));
    });
  }
}
