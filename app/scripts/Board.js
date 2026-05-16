import Sortable from 'sortablejs';

const STATUSES = ['backlog', 'todo', 'inprogress', 'done'];
const LABELS = { backlog: 'Backlog', todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
const TYPES = ['Story', 'Bug', 'Task', 'Spike'];
const PAGE = 10;

export default class Board {
  constructor(store) {
    this._store = store;
    this._backlogLimit = PAGE;
    this._sortables = [];
  }

  render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = this._html();
    this._bind(el);
    this._initSortable(el);
  }

  _html() {
    return `<div class="board-wrap shell"><div class="board-columns">${
      STATUSES.map(s => this._colHtml(s)).join('')
    }</div></div>`;
  }

  _colHtml(status) {
    const all = this._store.getCards().filter(c => c.status === status);
    const visible = status === 'backlog' ? all.slice(0, this._backlogLimit) : all;
    const remaining = status === 'backlog' ? all.length - this._backlogLimit : 0;
    return `<div class="board-col">
      <div class="board-col-header">
        <span class="board-col-title">${LABELS[status]}</span>
        <span class="board-col-count">${all.length}</span>
      </div>
      ${status === 'backlog' ? this._formHtml() : ''}
      <div class="board-col-cards" data-status="${status}">
        ${visible.map(c => this._cardHtml(c)).join('')}
      </div>
      ${remaining > 0 ? `<button class="board-load-more">Load ${remaining} more</button>` : ''}
    </div>`;
  }

  _formHtml() {
    return `<form class="board-add-form" autocomplete="off">
      <input class="board-add-title" type="text" placeholder="Card title" required>
      <div class="board-add-row">
        <select class="board-add-type">${TYPES.map(t => `<option>${t}</option>`).join('')}</select>
        <input class="board-add-points" type="number" placeholder="pts" min="0" step="1">
        <button type="submit" class="board-add-btn">Add</button>
      </div>
    </form>`;
  }

  _cardHtml(card) {
    return `<div class="board-card${card.blocked ? ' is-blocked' : ''}" data-id="${card.id}">
      <div class="board-card-header">
        <span class="board-card-type">${card.type || 'Story'}</span>
        ${card.points ? `<span class="board-card-points">${card.points}</span>` : ''}
      </div>
      <div class="board-card-title">${this._esc(card.title)}</div>
      <div class="board-card-footer">
        <label class="board-card-blocked-label">
          <input type="checkbox" class="board-card-blocked-cb" data-id="${card.id}"${card.blocked ? ' checked' : ''}> Blocked
        </label>
        <button class="board-card-delete" data-id="${card.id}">×</button>
      </div>
    </div>`;
  }

  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  _bind(el) {
    el.querySelector('.board-add-form').addEventListener('submit', e => {
      e.preventDefault();
      const title = el.querySelector('.board-add-title').value.trim();
      const type = el.querySelector('.board-add-type').value;
      const points = parseInt(el.querySelector('.board-add-points').value, 10) || 0;
      if (!title) return;
      this._store.addCard({ title, type, points });
      const backlogCount = this._store.getCards().filter(c => c.status === 'backlog').length;
      if (backlogCount > this._backlogLimit) this._backlogLimit = backlogCount;
      this.render(el.id);
    });

    const loadMore = el.querySelector('.board-load-more');
    if (loadMore) {
      loadMore.addEventListener('click', () => {
        this._backlogLimit += PAGE;
        this.render(el.id);
      });
    }

    el.querySelectorAll('.board-card-blocked-cb').forEach(cb => {
      cb.addEventListener('change', e => {
        this._store.updateCard(e.target.dataset.id, { blocked: e.target.checked });
        e.target.closest('.board-card').classList.toggle('is-blocked', e.target.checked);
      });
    });

    el.querySelectorAll('.board-card-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        this._store.removeCard(e.target.dataset.id);
        this.render(el.id);
      });
    });
  }

  _initSortable(el) {
    this._sortables.forEach(s => s.destroy());
    this._sortables = [];
    el.querySelectorAll('.board-col-cards').forEach(col => {
      this._sortables.push(new Sortable(col, {
        group: 'board',
        animation: 150,
        ghostClass: 'board-card-ghost',
        onEnd: evt => {
          const id = evt.item.dataset.id;
          const newStatus = evt.to.dataset.status;
          const patch = { status: newStatus };
          if (newStatus === 'todo') {
            const active = this._store.getIntervals().find(iv => iv.active);
            if (active) patch.intervalId = active.id;
          }
          this._store.updateCard(id, patch);
          this.render(el.id);
        }
      }));
    });
  }
}
