const COL_W = 140;
const STATUS_NEXT = { todo: 'inprogress', inprogress: 'done', done: 'todo' };
const STATUS_LABEL = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
const STATUS_VAR = { todo: 'var(--c-todo)', inprogress: 'var(--c-inprogress)', done: 'var(--c-done)' };

class TimelineEditor {
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

  _rowHtml(tl, count) {
    const start = Math.max(0, tl.intervalStart);
    const end = Math.min(count - 1, tl.intervalEnd);
    const color = STATUS_VAR[tl.status] || 'var(--c-default)';

    return `<div class="gantt-row" data-id="${this._esc(tl.id)}">
      <div class="gantt-row-label">
        <span class="tl-name">${this._esc(tl.name)}</span>
        <button class="tl-status-btn" data-id="${this._esc(tl.id)}"
          data-next="${STATUS_NEXT[tl.status]}"
          style="background:${color}">${STATUS_LABEL[tl.status]}</button>
        <button class="tl-delete-btn" data-id="${this._esc(tl.id)}" title="Delete">×</button>
      </div>
      <div class="gantt-cells">
        <div class="gantt-bar" data-id="${this._esc(tl.id)}"
          style="left:${start * COL_W}px;width:${(end - start + 1) * COL_W}px;background:${color}">
          <div class="gantt-handle" data-edge="start" data-id="${this._esc(tl.id)}"></div>
          <span class="gantt-bar-label">${this._esc(tl.name)}</span>
          <div class="gantt-handle" data-edge="end" data-id="${this._esc(tl.id)}"></div>
        </div>
      </div>
    </div>`;
  }

  render() {
    const data = this.store.load();
    const { intervals, timelines } = data;

    if (!intervals.length) {
      this.el.innerHTML = `<div class="planner-view">
        <div class="planner-toolbar">
          <h3 class="planner-heading">Timeline</h3>
        </div>
        <p class="empty-msg">Create intervals in the Interval Planner tab to use the Timeline editor.</p>
      </div>`;
      return;
    }

    const headerCols = intervals.map(iv =>
      `<div class="gantt-col-head" style="width:${COL_W}px">${this._esc(iv.name)}</div>`
    ).join('');

    const totalW = intervals.length * COL_W;
    const rows = timelines.map(tl => this._rowHtml(tl, intervals.length)).join('');

    this.el.innerHTML = `<div class="planner-view">
      <div class="planner-toolbar">
        <h3 class="planner-heading">Timeline</h3>
        <button class="card-form-btn primary" id="add-theme-btn">+ Add Theme</button>
      </div>
      <div class="gantt">
        <div class="gantt-header">
          <div class="gantt-row-label"></div>
          <div class="gantt-header-cols">${headerCols}</div>
        </div>
        <div class="gantt-body" style="--gantt-w:${totalW}px">
          ${rows}
          ${!timelines.length ? '<p class="empty-msg" style="padding:24px">No themes yet — click &ldquo;+ Add Theme&rdquo; to create one.</p>' : ''}
        </div>
      </div>
    </div>`;

    this._bind(data);
  }

  _bind(data) {
    this.el.querySelector('#add-theme-btn').addEventListener('click', () => {
      const name = prompt('Theme / Epic name:');
      if (!name || !name.trim()) return;
      const d = this.store.load();
      d.timelines.push({
        id: this._uid(),
        name: name.trim(),
        status: 'todo',
        intervalStart: 0,
        intervalEnd: Math.min(1, d.intervals.length - 1)
      });
      this.store.save(d);
      this.render();
    });

    this.el.querySelectorAll('.tl-status-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const d = this.store.load();
        const tl = d.timelines.find(t => t.id === e.target.dataset.id);
        if (tl) { tl.status = e.target.dataset.next; this.store.save(d); this.render(); }
      });
    });

    this.el.querySelectorAll('.tl-delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        if (!confirm('Delete this theme?')) return;
        const d = this.store.load();
        d.timelines = d.timelines.filter(t => t.id !== e.target.dataset.id);
        this.store.save(d);
        this.render();
      });
    });

    this.el.querySelectorAll('.gantt-handle').forEach(handle => {
      handle.addEventListener('mousedown', e => {
        e.preventDefault();
        const id = e.target.dataset.id;
        const edge = e.target.dataset.edge;
        const startX = e.clientX;
        const d = this.store.load();
        const tl = d.timelines.find(t => t.id === id);
        if (!tl) return;
        const origStart = tl.intervalStart;
        const origEnd = tl.intervalEnd;
        const maxIdx = data.intervals.length - 1;

        const onMove = mv => {
          const delta = Math.round((mv.clientX - startX) / COL_W);
          if (edge === 'start') {
            tl.intervalStart = Math.max(0, Math.min(origStart + delta, tl.intervalEnd));
          } else {
            tl.intervalEnd = Math.min(maxIdx, Math.max(tl.intervalStart, origEnd + delta));
          }
          this.store.save(d);
          this.render();
        };

        const onUp = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  }
}

export default TimelineEditor;
