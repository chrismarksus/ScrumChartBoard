const STATUS_CYCLE = ['todo', 'inprogress', 'done'];
const STATUS_LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

export default class TimelineEditor {
  constructor(store) {
    this._store = store;
    this._showAddForm = false;
  }

  render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = this._html();
    this._bind(el);
  }

  _html() {
    const intervals = this._store.getIntervals();
    const timelines = this._store.getTimelines();
    return `<div class="timeline-wrap shell">
      <div class="timeline-header">
        <span class="timeline-title">Timeline</span>
        <button class="timeline-add-btn">+ Add Theme</button>
      </div>
      ${this._showAddForm ? this._addFormHtml() : ''}
      ${intervals.length === 0 && timelines.length === 0
        ? '<p class="timeline-empty">Create intervals in the Interval Planner, then add themes here.</p>'
        : this._gridHtml(timelines, intervals)
      }
    </div>`;
  }

  _addFormHtml() {
    return `<form class="timeline-add-form" autocomplete="off">
      <input class="timeline-f-name" type="text" placeholder="Theme name" required>
      <button type="submit" class="timeline-f-submit">Add</button>
      <button type="button" class="timeline-f-cancel">Cancel</button>
    </form>`;
  }

  _gridHtml(timelines, intervals) {
    const colSpan = 3 + intervals.length;
    return `<div class="timeline-grid-wrap">
      <table class="timeline-grid">
        <thead>
          <tr>
            <th class="tl-col-name">Theme</th>
            <th class="tl-col-status">Status</th>
            ${intervals.map(iv => `<th class="tl-col-iv">${this._esc(iv.name)}</th>`).join('')}
            <th class="tl-col-range">Range</th>
            <th class="tl-col-del"></th>
          </tr>
        </thead>
        <tbody>
          ${timelines.length
            ? timelines.map(t => this._rowHtml(t, intervals)).join('')
            : `<tr><td colspan="${colSpan}" class="tl-empty-row">No themes yet — click <strong>+ Add Theme</strong> to create one.</td></tr>`
          }
        </tbody>
      </table>
    </div>`;
  }

  _rowHtml(theme, intervals) {
    return `<tr data-id="${theme.id}">
      <td class="tl-name">${this._esc(theme.name)}</td>
      <td class="tl-status">
        <button class="tl-status-btn tl-status-${theme.status}" data-id="${theme.id}">
          ${STATUS_LABELS[theme.status] || 'To Do'}
        </button>
      </td>
      ${intervals.map((iv, i) => {
        const active = i >= theme.intervalStart && i <= theme.intervalEnd;
        return `<td class="tl-cell${active ? ` tl-active tl-${theme.status}` : ''}"></td>`;
      }).join('')}
      <td class="tl-range">
        ${intervals.length
          ? `${this._rangeSelect('tl-start-sel', theme.id, theme.intervalStart, intervals)}
             <span class="tl-arrow">→</span>
             ${this._rangeSelect('tl-end-sel', theme.id, theme.intervalEnd, intervals)}`
          : '<span class="tl-muted">Add intervals first</span>'
        }
      </td>
      <td class="tl-del">
        <button class="tl-del-btn" data-id="${theme.id}">×</button>
      </td>
    </tr>`;
  }

  _rangeSelect(cls, themeId, selectedIdx, intervals) {
    const opts = intervals.map((iv, i) =>
      `<option value="${i}"${i === selectedIdx ? ' selected' : ''}>${this._esc(iv.name)}</option>`
    ).join('');
    return `<select class="${cls}" data-id="${themeId}">${opts}</select>`;
  }

  _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  _bind(el) {
    el.querySelector('.timeline-add-btn').addEventListener('click', () => {
      this._showAddForm = !this._showAddForm;
      this.render(el.id);
    });

    const form = el.querySelector('.timeline-add-form');
    if (form) {
      form.querySelector('.timeline-f-cancel').addEventListener('click', () => {
        this._showAddForm = false;
        this.render(el.id);
      });
      form.addEventListener('submit', e => {
        e.preventDefault();
        const name = el.querySelector('.timeline-f-name').value.trim();
        if (!name) return;
        this._store.addTimeline({ name });
        this._showAddForm = false;
        this.render(el.id);
      });
    }

    el.querySelectorAll('.tl-status-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const theme = this._store.getTimelines().find(t => t.id === e.target.dataset.id);
        if (!theme) return;
        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(theme.status) + 1) % STATUS_CYCLE.length];
        this._store.updateTimeline(theme.id, { status: next });
        this.render(el.id);
      });
    });

    el.querySelectorAll('.tl-start-sel').forEach(sel => {
      sel.addEventListener('change', e => {
        const newStart = parseInt(e.target.value, 10);
        const theme = this._store.getTimelines().find(t => t.id === e.target.dataset.id);
        if (!theme) return;
        this._store.updateTimeline(theme.id, {
          intervalStart: newStart,
          intervalEnd: Math.max(newStart, theme.intervalEnd)
        });
        this.render(el.id);
      });
    });

    el.querySelectorAll('.tl-end-sel').forEach(sel => {
      sel.addEventListener('change', e => {
        const newEnd = parseInt(e.target.value, 10);
        const theme = this._store.getTimelines().find(t => t.id === e.target.dataset.id);
        if (!theme) return;
        this._store.updateTimeline(theme.id, {
          intervalStart: Math.min(newEnd, theme.intervalStart),
          intervalEnd: newEnd
        });
        this.render(el.id);
      });
    });

    el.querySelectorAll('.tl-del-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        this._store.removeTimeline(e.target.dataset.id);
        this.render(el.id);
      });
    });
  }
}
