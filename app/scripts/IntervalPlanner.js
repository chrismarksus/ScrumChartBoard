import Sortable from 'sortablejs';

// Pure helpers for capacity warnings (Phase 1): committed excludes 'done' cards.
function computeCapacityPerInterval(intervals, cards) {
  return intervals.map(iv => {
    const committed = cards
      .filter(c => c.intervalId === iv.id && c.status !== 'done')
      .reduce((s, c) => s + (c.points || 0), 0);
    return {
      id: iv.id,
      name: iv.name || 'Interval',
      committed,
      capacity: Number(iv.capacity || 0)
    };
  });
}

function checkCapacity(intervals, cards) {
  const per = computeCapacityPerInterval(intervals, cards);
  return per
    .filter(p => p.capacity > 0 && p.committed > p.capacity)
    .map(p => ({
      id: p.id,
      name: p.name,
      committed: p.committed,
      capacity: p.capacity,
      over: p.committed - p.capacity
    }));
}

// Basic velocity suggestion (Phase 1 optional): avg completed (done) points across intervals that have history.
function computeSuggestedCapacity(intervals, cards) {
  const completed = intervals.map(iv => {
    return cards
      .filter(c => c.intervalId === iv.id && c.status === 'done')
      .reduce((s, c) => s + (c.points || 0), 0);
  }).filter(v => v > 0);
  if (!completed.length) return 0;
  const sum = completed.reduce((a, b) => a + b, 0);
  return Math.round(sum / completed.length);
}

export default class IntervalPlanner {
  constructor(store) {
    this._store = store;
    this._sortables = [];
    this._showForm = false;
    this._editingId = null;  // for inline interval editing
  }

  render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = this._html();
    this._bind(el);
    this._initSortable(el);
    // Capacity warnings (live on every render; committed = non-done points)
    const intervals = this._store.getIntervals();
    const cards = this._store.getCards();
    const warns = checkCapacity(intervals, cards);
    if (warns.length) {
      this._renderCapacityWarnings(warns, el);
    }
    // Basic velocity suggestion (Phase 1): actionable fill + hint when form open
    if (this._showForm) {
      const sug = computeSuggestedCapacity(intervals, cards);
      const cap = el.querySelector('.planner-f-capacity');
      const sugBtn = el.querySelector('.planner-suggest-cap');
      if (sug > 0) {
        if (cap) cap.placeholder = `Capacity (pts; ~${sug} from history)`;
        if (sugBtn) sugBtn.textContent = `Use ~${sug}`;
      } else if (sugBtn) {
        sugBtn.textContent = 'Use suggested';
      }
    }
  }

  _renderCapacityWarnings(warns, container) {
    // Remove any prior banner
    container.querySelectorAll('.capacity-warnings').forEach(e => e.remove());
    const wrap = document.createElement('div');
    wrap.className = 'capacity-warnings';
    warns.forEach(w => {
      const div = document.createElement('div');
      div.className = 'capacity-warning';
      div.textContent = `Over-allocated on ${w.name} by ${w.over} points (committed ${w.committed} / capacity ${w.capacity})`;
      wrap.appendChild(div);
    });
    const header = container.querySelector('.planner-header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(wrap, header.nextSibling);
    } else {
      container.insertBefore(wrap, container.firstChild);
    }
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
            : '<p class="planner-empty">No intervals yet — click <strong>+ New Interval</strong> to create one.<br><small>Tip: finish some cards (status=done) then velocity suggestions will appear in the form.</small></p>'
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
      <input class="planner-f-capacity" type="number" min="0" step="1" placeholder="Capacity (pts)" title="Optional capacity in points">
      <button type="button" class="planner-suggest-cap" title="Use average completed points from past intervals (velocity hint)">Use suggested</button>
      <button type="submit" class="planner-f-submit">Create</button>
      <button type="button" class="planner-f-cancel">Cancel</button>
    </form>`;
  }

  _laneHtml(iv) {
    const cards = this._store.getCards().filter(c => c.intervalId === iv.id);
    const pts = cards.reduce((s, c) => s + (c.points || 0), 0);
    const isEditing = this._editingId === iv.id;
    let header = '';
    if (isEditing) {
      header = `<div class="planner-lane-header">
        <input class="planner-edit-name" type="text" value="${this._esc(iv.name)}" data-id="${iv.id}">
        <input class="planner-edit-start" type="date" value="${iv.startDate || ''}" data-id="${iv.id}">
        <input class="planner-edit-end" type="date" value="${iv.endDate || ''}" data-id="${iv.id}">
        <input class="planner-edit-capacity" type="number" min="0" step="1" value="${iv.capacity || 0}" data-id="${iv.id}" title="Capacity in points">
        <button class="planner-save-edit" data-id="${iv.id}">Save</button>
        <button class="planner-cancel-edit" data-id="${iv.id}">Cancel</button>
        <button class="planner-active-btn${iv.active ? ' is-active' : ''}" data-id="${iv.id}">${iv.active ? 'Active ✓' : 'Set active'}</button>
        <button class="planner-del-lane" data-id="${iv.id}">×</button>
      </div>`;
    } else {
      const cap = Number(iv.capacity || 0);
      const over = (cap > 0 && pts > cap) ? (pts - cap) : 0;
      header = `<div class="planner-lane-header">
        <span class="planner-lane-name" data-editable="${iv.id}">${this._esc(iv.name)}</span>
        ${iv.startDate ? `<span class="planner-lane-dates">${iv.startDate} – ${iv.endDate || ''}</span>` : ''}
        <span class="planner-lane-pts">${pts} pts${cap ? ` / ${cap}` : ''}</span>
        ${over ? `<span class="planner-warning" title="Over capacity by ${over} points">⚠</span>` : (pts > 40 ? '<span class="planner-warning" title=\'High commitment — check capacity\'>⚠</span>' : '')}
        <button class="planner-edit-lane" data-id="${iv.id}" title='Edit name/dates'>✎</button>
        <button class="planner-active-btn${iv.active ? ' is-active' : ''}" data-id="${iv.id}">${iv.active ? 'Active ✓' : 'Set active'}</button>
        <button class="planner-del-lane" data-id="${iv.id}">×</button>
      </div>`;
    }
    return `<div class="planner-lane${iv.active ? ' is-active' : ''}">
      ${header}
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
        const capRaw = el.querySelector('.planner-f-capacity').value;
        const capacity = capRaw ? parseInt(capRaw, 10) : 0;
        this._store.addInterval({
          name,
          startDate: el.querySelector('.planner-f-start').value,
          endDate: el.querySelector('.planner-f-end').value,
          capacity: capacity || undefined
        });
        this._showForm = false;
        this.render(el.id);
      });

      // Velocity suggestion: actionable "Use suggested" button fills capacity from historical avg done pts
      const suggestBtn = el.querySelector('.planner-suggest-cap');
      if (suggestBtn) {
        suggestBtn.addEventListener('click', () => {
          const intervals = this._store.getIntervals();
          const cards = this._store.getCards();
          const sug = computeSuggestedCapacity(intervals, cards);
          const capInput = el.querySelector('.planner-f-capacity');
          if (capInput && sug > 0) {
            capInput.value = sug;
            capInput.dispatchEvent(new Event('input', { bubbles: true })); // in case future listeners
          }
        });
      }
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

    // Editing intervals (name/dates)
    el.querySelectorAll('.planner-edit-lane').forEach(btn => {
      btn.addEventListener('click', e => {
        this._editingId = e.target.dataset.id;
        this.render(el.id);
      });
    });

    el.querySelectorAll('.planner-lane-name[data-editable]').forEach(span => {
      span.addEventListener('dblclick', e => {
        this._editingId = e.target.dataset.editable;
        this.render(el.id);
      });
    });

    el.querySelectorAll('.planner-save-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.target.dataset.id;
        const name = el.querySelector(`.planner-edit-name[data-id="${id}"]`).value.trim();
        const start = el.querySelector(`.planner-edit-start[data-id="${id}"]`).value;
        const end = el.querySelector(`.planner-edit-end[data-id="${id}"]`).value;
        const capEl = el.querySelector(`.planner-edit-capacity[data-id="${id}"]`);
        const capacity = capEl ? (parseInt(capEl.value, 10) || 0) : 0;
        if (name) {
          this._store.updateInterval(id, { name, startDate: start, endDate: end, capacity: capacity || undefined });
        }
        this._editingId = null;
        this.render(el.id);
      });
    });

    el.querySelectorAll('.planner-cancel-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        this._editingId = null;
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
