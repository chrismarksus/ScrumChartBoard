import Sortable from 'sortablejs';

const CARD_TYPES = ['Story', 'Spike', 'Improvement', 'Testing', 'Issue', 'Defect'];
const BACKLOG_PAGE = 10;

const COLUMNS = [
  { status: 'backlog',    label: 'Backlog' },
  { status: 'todo',       label: 'To Do' },
  { status: 'inprogress', label: 'In Progress' },
  { status: 'done',       label: 'Done' }
];

class Board {
  constructor(elId, store) {
    this.el = document.getElementById(elId);
    this.store = store;
    this._backlogPage = 1;
  }

  _uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  _activeInterval(data) {
    if (!data.intervals.length) return null;
    const today = new Date().toISOString().slice(0, 10);
    return data.intervals.find(iv => iv.startDate <= today && iv.endDate >= today)
      || data.intervals[data.intervals.length - 1];
  }

  _cardHtml(card) {
    return `<div class="board-card${card.blocked ? ' is-blocked' : ''}" data-id="${this._esc(card.id)}">
      <div class="card-meta">
        <span class="card-type">${this._esc(card.type)}</span>
        <span class="card-points">${card.points > 0 ? card.points : '—'}</span>
      </div>
      <div class="card-title">${this._esc(card.title)}</div>
      <div class="card-footer">
        <label class="blocked-label">
          <input type="checkbox" class="blocked-cb"${card.blocked ? ' checked' : ''} />
          <span>Blocked</span>
        </label>
      </div>
    </div>`;
  }

  _formHtml() {
    const opts = CARD_TYPES.map(t => `<option>${t}</option>`).join('');
    return `<form class="add-card-form" id="add-card-form">
      <input class="card-input" name="title" type="text" placeholder="Card title" required autocomplete="off" />
      <div class="card-form-row">
        <select class="card-select" name="type">${opts}</select>
        <input class="card-input pts" name="points" type="number" placeholder="Pts" min="0" />
      </div>
      <div class="card-form-actions">
        <button type="submit" class="card-form-btn primary">Add Card</button>
        <button type="button" class="card-form-btn" id="cancel-card">Cancel</button>
      </div>
    </form>`;
  }

  _colHtml(col, allCards) {
    const isBacklog = col.status === 'backlog';
    const visible = isBacklog
      ? allCards.slice(0, this._backlogPage * BACKLOG_PAGE)
      : allCards;
    const remaining = isBacklog ? allCards.length - visible.length : 0;

    return `<div class="board-col" data-status="${col.status}">
      <div class="board-col-head">
        <span class="col-label">${col.label}</span>
        <span class="col-count">${allCards.length}</span>
        ${isBacklog ? '<button class="col-add-btn" id="show-add-form">+</button>' : ''}
      </div>
      ${isBacklog ? '<div id="add-card-area"></div>' : ''}
      <div class="board-cards" data-status="${col.status}">
        ${visible.map(c => this._cardHtml(c)).join('')}
      </div>
      ${remaining > 0 ? `<button class="load-more-btn" id="load-more">${remaining} more — Load more</button>` : ''}
    </div>`;
  }

  render() {
    const data = this.store.load();
    const cols = COLUMNS.map(col => {
      const cards = data.cards.filter(c => c.status === col.status);
      return this._colHtml(col, cards);
    });
    this.el.innerHTML = `<div class="board">${cols.join('')}</div>`;
    this._bind(data);
    this._initSortable(data);
  }

  _bind(data) {
    const showBtn = this.el.querySelector('#show-add-form');
    if (showBtn) {
      showBtn.addEventListener('click', () => {
        const area = this.el.querySelector('#add-card-area');
        if (area.innerHTML) { area.innerHTML = ''; return; }
        area.innerHTML = this._formHtml();
        area.querySelector('[name="title"]').focus();
        area.querySelector('#cancel-card').addEventListener('click', () => { area.innerHTML = ''; });
        area.querySelector('#add-card-form').addEventListener('submit', e => {
          e.preventDefault();
          this._addCard(e.target);
        });
      });
    }

    const loadMore = this.el.querySelector('#load-more');
    if (loadMore) {
      loadMore.addEventListener('click', () => {
        this._backlogPage++;
        this.render();
      });
    }

    this.el.querySelectorAll('.blocked-cb').forEach(cb => {
      cb.addEventListener('change', e => {
        const id = e.target.closest('.board-card').dataset.id;
        const d = this.store.load();
        const card = d.cards.find(c => c.id === id);
        if (card) {
          card.blocked = e.target.checked;
          this.store.save(d);
          e.target.closest('.board-card').classList.toggle('is-blocked', card.blocked);
        }
      });
    });
  }

  _addCard(form) {
    const data = this.store.load();
    data.cards.unshift({
      id: this._uid(),
      title: form.title.value.trim(),
      type: form.type.value,
      points: parseInt(form.points.value, 10) || 0,
      status: 'backlog',
      blocked: false,
      intervalId: null
    });
    this.store.save(data);
    this.render();
  }

  _initSortable(data) {
    this.el.querySelectorAll('.board-cards').forEach(list => {
      Sortable.create(list, {
        group: 'board',
        animation: 150,
        ghostClass: 'card-ghost',
        chosenClass: 'card-chosen',
        onEnd: evt => {
          const id = evt.item.dataset.id;
          const newStatus = evt.to.dataset.status;
          const d = this.store.load();
          const card = d.cards.find(c => c.id === id);
          if (!card || card.status === newStatus) return;
          const prev = card.status;
          card.status = newStatus;
          if (prev === 'backlog' && newStatus === 'todo') {
            const active = this._activeInterval(d);
            if (active) card.intervalId = active.id;
          }
          this.store.save(d);
          this.render();
        }
      });
    });
  }
}

export default Board;
