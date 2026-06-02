import Sortable from 'sortablejs';
import BoardAdapter from './BoardAdapter.js';

const STATUSES = ['backlog', 'todo', 'inprogress', 'done'];
const LABELS = { backlog: 'Backlog', todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
const TYPES = ['Story', 'Bug', 'Task', 'Spike'];
const PAGE = 10;

export default class Board {
  constructor(store) {
    this._store = store;
    this._backlogLimit = PAGE;
    this._sortables = [];
    this._lastContainerId = null;
  }

  render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    this._lastContainerId = containerId;
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
        ${status === 'backlog' ? '<button class="board-import-btn" data-action="csv" title="Import cards from CSV (columns: title,type,points,blocked)">Import CSV</button><a href="samples/sample-board-cards.csv" download class="board-import-btn" style="margin-left:4px;text-decoration:none;" title="Download starter CSV with example cards (title,type,points,blocked)">Sample CSV</a><button class="board-import-btn" data-action="export" title="Export current board cards + planner intervals/timelines as the 3 JSON files (dashboard.json, project.json, intervals.json) for static hosting or editor import. Uses live board data via BoardAdapter." style="margin-left:4px;">Export JSON</button>' : ''}
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

    const importBtn = el.querySelector('.board-import-btn[data-action="csv"]');
    if (importBtn) {
      importBtn.addEventListener('click', () => this._importCSV());
    }
    const exportBtn = el.querySelector('.board-import-btn[data-action="export"]');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this._exportBoardJson());
    }
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

  _parseCSV(text) {
    if (!text) return [];
    const lines = text.replace(/\r/g, '').trim().split('\n');
    if (lines.length < 2) return [];
    const headerLine = lines[0];
    const headers = this._splitCSVLine(headerLine).map(h => h.toLowerCase().trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = this._splitCSVLine(line);
      const row = {};
      headers.forEach((h, j) => { row[h] = (values[j] || '').trim(); });
      result.push(row);
    }
    return result;
  }

  _splitCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(v => v.replace(/^"|"$/g, '').trim());
  }

  _importCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        const rows = this._parseCSV(text);
        let added = 0;
        rows.forEach(r => {
          const title = (r.title || r['card title'] || r.name || '').trim();
          if (!title) return;
          const type = r.type || r['card type'] || 'Story';
          let points = parseInt(r.points || r.pts || r.effort || '0', 10);
          if (isNaN(points)) points = 0;
          const blockedStr = (r.blocked || r['is blocked'] || '').toLowerCase();
          const blocked = blockedStr === 'true' || blockedStr === 'yes' || blockedStr === '1';
          this._store.addCard({ title, type, points, blocked });
          added++;
        });
        document.body.removeChild(input);
        if (added > 0) {
          const backlogCount = this._store.getCards().filter(c => c.status === 'backlog').length;
          if (backlogCount > this._backlogLimit) this._backlogLimit = backlogCount;
          if (this._lastContainerId) {
            this.render(this._lastContainerId);
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  _exportBoardJson() {
    try {
      const snap = {
        cards: this._store.getCards(),
        intervals: this._store.getIntervals(),
        timelines: this._store.getTimelines()
      };
      const out = BoardAdapter.toJsonFiles(snap);
      // out = { dashboard, project: { project }, intervals: { intervals } }
      this._downloadJson('dashboard.json', out.dashboard);
      this._downloadJson('project.json', out.project);
      this._downloadJson('intervals.json', out.intervals);
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed (see console)');
    }
  }

  _downloadJson(filename, dataObj) {
    const json = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
