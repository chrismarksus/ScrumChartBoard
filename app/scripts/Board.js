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
    this._backlogFilter = '';
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
    let all = this._store.getCards().filter(c => c.status === status);
    if (status === 'backlog' && this._backlogFilter) {
      const f = this._backlogFilter.toLowerCase();
      all = all.filter(c => (c.title || '').toLowerCase().includes(f) || (c.type || '').toLowerCase().includes(f));
    }
    const visible = status === 'backlog' ? all.slice(0, this._backlogLimit) : all;
    const remaining = status === 'backlog' ? all.length - this._backlogLimit : 0;
    return `<div class="board-col">
      <div class="board-col-header">
        <span class="board-col-title">${LABELS[status]}</span>
        <span class="board-col-count">${all.length}</span>
        ${status === 'backlog' ? '<button class="board-import-btn" data-action="csv" title="Import cards from CSV (columns: title,type,points,blocked,status?,intervalId? for roundtrip)">Import CSV</button><a href="samples/sample-board-cards.csv" download class="board-import-btn" style="margin-left:4px;text-decoration:none;" title="Download starter CSV with example cards (title,type,points,blocked,status,intervalId)">Sample CSV</a><button class="board-import-btn" data-action="github" title="Import open issues from a public (or token-auth) GitHub repo as cards. Labels map to type (bug->Bug, etc); (N) or [N] in title/body for points. Imports to backlog.">Import GitHub</button><button class="board-import-btn" data-action="export-csv" title="Export current cards as CSV (with status, intervalId for roundtrip import)." style="margin-left:4px;">Export Cards CSV</button><button class="board-import-btn" data-action="export" title="Export current board cards + planner intervals/timelines as the 3 JSON files (dashboard.json, project.json, intervals.json) for static hosting or editor import. Uses live board data via BoardAdapter." style="margin-left:4px;">Export JSON</button><button class="board-import-btn" data-action="export-state" title="Export full board state {cards,intervals,timelines} as JSON for backup/roundtrip." style="margin-left:4px;">Export State</button><button class="board-import-btn" data-action="import-state" title="Import full board state JSON (replaces current planning data)." style="margin-left:4px;">Import State</button>' : ''}
        ${status === 'backlog' ? `<input class="board-filter" type="text" placeholder="Filter backlog..." value="${this._backlogFilter || ''}">` : ''}
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
      <div class="board-card-title" data-editable-title="${card.id}">${this._esc(card.title)}</div>
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
        if (typeof confirm === 'function' && !confirm('Delete this card?')) return;
        this._store.removeCard(e.target.dataset.id);
        this.render(el.id);
      });
    });

    const importBtn = el.querySelector('.board-import-btn[data-action="csv"]');
    if (importBtn) {
      importBtn.addEventListener('click', () => this._importCSV());
    }
    const ghBtn = el.querySelector('.board-import-btn[data-action="github"]');
    if (ghBtn) {
      ghBtn.addEventListener('click', () => this._importFromGitHub());
    }
    const exportBtn = el.querySelector('.board-import-btn[data-action="export"]');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this._exportBoardJson());
    }
    const exportStateBtn = el.querySelector('.board-import-btn[data-action="export-state"]');
    if (exportStateBtn) {
      exportStateBtn.addEventListener('click', () => this._exportFullState());
    }
    const importStateBtn = el.querySelector('.board-import-btn[data-action="import-state"]');
    if (importStateBtn) {
      importStateBtn.addEventListener('click', () => this._importFullState());
    }
    const exportCsvBtn = el.querySelector('.board-import-btn[data-action="export-csv"]');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this._exportCardsCSV());
    }

    // Small polish: backlog filter input (live, case-insensitive on title/type)
    const filterInput = el.querySelector('.board-filter');
    if (filterInput) {
      filterInput.addEventListener('input', (e) => {
        this._backlogFilter = e.target.value || '';
        // reset limit so user sees results from top of (filtered) backlog
        this._backlogLimit = PAGE;
        if (this._lastContainerId) this.render(this._lastContainerId);
      });
    }

    // Small polish: dblclick title to edit inline (title only for now; type/points via re-add or future)
    el.querySelectorAll('.board-card-title[data-editable-title]').forEach(titleEl => {
      titleEl.addEventListener('dblclick', () => {
        const id = titleEl.dataset.editableTitle;
        const current = this._store.getCards().find(c => c.id === id);
        if (!current) return;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = current.title || '';
        input.style.width = '100%';
        titleEl.replaceWith(input);
        input.focus();
        input.select();
        const commit = () => {
          const newTitle = input.value.trim();
          if (newTitle && newTitle !== current.title) {
            this._store.updateCard(id, { title: newTitle });
          }
          if (this._lastContainerId) this.render(this._lastContainerId);
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
          if (ev.key === 'Escape') { if (this._lastContainerId) this.render(this._lastContainerId); }
        });
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
          const status = (r.status || 'backlog').toLowerCase().trim();
          let intervalId = r.intervalId || r.interval || r['interval id'] || null;
          if (intervalId && typeof intervalId === 'string' && intervalId.trim() === '') intervalId = null;
          this._store.addCard({ title, type, points, blocked, status, intervalId });
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

  async _importFromGitHub() {
    // GitHub import (Phase 1): public repos work unauth; PAT for private/higher limits/rate.
    // Inline mini-form (better than prompts) in the backlog column. Uses shared mapper for type/points heuristics.
    const col = document.querySelector('.board-col-cards[data-status="backlog"]');
    if (!col) return;
    // Remove any prior gh form
    const prior = document.getElementById('gh-import-form');
    if (prior) prior.remove();
    const form = document.createElement('div');
    form.id = 'gh-import-form';
    form.style.cssText = 'margin:8px 0;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--surface-2);font-size:12px;';
    form.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
        <input id="gh-repo" type="text" placeholder="owner/repo (e.g. facebook/react)" style="flex:1;min-width:160px;font-size:12px;padding:4px;">
        <input id="gh-token" type="password" placeholder="token (opt, for private/rate)" style="width:120px;font-size:12px;padding:4px;">
        <button id="gh-go" class="board-import-btn" style="padding:4px 10px;">Go</button>
        <button id="gh-cancel" class="board-import-btn" style="padding:4px 8px;">Cancel</button>
      </div>
      <div id="gh-status" style="margin-top:4px;color:var(--text-muted);"></div>
    `;
    col.parentNode.insertBefore(form, col);
    const repoIn = form.querySelector('#gh-repo');
    const tokIn = form.querySelector('#gh-token');
    const goBtn = form.querySelector('#gh-go');
    const cancelBtn = form.querySelector('#gh-cancel');
    const st = form.querySelector('#gh-status');
    cancelBtn.addEventListener('click', () => form.remove());
    goBtn.addEventListener('click', async () => {
      const repo = (repoIn.value || '').trim();
      if (!repo || !repo.includes('/')) { st.textContent = 'Enter owner/repo'; return; }
      const token = (tokIn.value || '').trim();
      const headers = { 'Accept': 'application/vnd.github+json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      st.textContent = 'Fetching...';
      goBtn.disabled = true;
      try {
        const url = `https://api.github.com/repos/${encodeURIComponent(repo)}/issues?state=open&per_page=100`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error(`GitHub ${res.status} (bad token or private repo; use PAT with repo scope)`);
          }
          if (res.status === 404) {
            throw new Error('GitHub 404 (repo not found or private without PAT)');
          }
          if (res.status === 429) {
            throw new Error('GitHub rate limit (429). Wait or provide PAT for higher limits.');
          }
          throw new Error(`GitHub ${res.status}`);
        }
        const issues = await res.json();
        let added = 0;
        (issues || []).forEach(iss => {
          const c = mapGitHubIssueToCard(iss);
          if (c) {
            this._store.addCard(c);
            added++;
          }
        });
        form.remove();
        if (added > 0) {
          const backlogCount = this._store.getCards().filter(c => c.status === 'backlog').length;
          if (backlogCount > this._backlogLimit) this._backlogLimit = backlogCount;
          if (this._lastContainerId) this.render(this._lastContainerId);
        } else {
          // show transient note (re-render will clear form area)
          const note = document.createElement('div');
          note.style.cssText = 'margin:4px 0;font-size:11px;color:var(--text-muted);';
          note.textContent = 'No open issues imported (or all were PRs).';
          col.parentNode.insertBefore(note, col);
          setTimeout(() => note.remove(), 2200);
        }
      } catch (e) {
        st.textContent = 'Failed: ' + (e.message || e);
        goBtn.disabled = false;
      }
    });
    // focus
    setTimeout(() => repoIn.focus(), 0);
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

  _exportFullState() {
    try {
      const snap = {
        cards: this._store.getCards(),
        intervals: this._store.getIntervals(),
        timelines: this._store.getTimelines()
      };
      this._downloadJson('board-full-state.json', snap);
    } catch (e) {
      console.error('Full state export failed', e);
      alert('Export failed (see console)');
    }
  }

  _importFullState() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
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
        try {
          const data = JSON.parse(ev.target.result);
          if (data && Array.isArray(data.cards) && Array.isArray(data.intervals) && Array.isArray(data.timelines)) {
            if (typeof this._store.importState === 'function') {
              this._store.importState(data);
            } else {
              this._store._data = { cards: data.cards, intervals: data.intervals, timelines: data.timelines };
              this._store._save();
            }
            const backlogCount = this._store.getCards().filter(c => c.status === 'backlog').length;
            if (backlogCount > this._backlogLimit) this._backlogLimit = backlogCount;
            if (this._lastContainerId) {
              this.render(this._lastContainerId);
            }
            alert('Board state imported successfully.');
          } else {
            alert('Invalid board state JSON (must have cards, intervals, timelines arrays).');
          }
        } catch (err) {
          console.error('Import state failed', err);
          alert('Failed to import (see console).');
        }
        document.body.removeChild(input);
      };
      reader.readAsText(file);
    };
    input.click();
  }

  _exportCardsCSV() {
    try {
      const cards = this._store.getCards();
      let csv = 'title,type,points,blocked,status,intervalId\n';
      cards.forEach(c => {
        const title = (c.title || '').replace(/"/g, '""');
        const row = [
          `"${title}"`,
          c.type || 'Story',
          c.points || 0,
          c.blocked ? 'true' : 'false',
          c.status || 'backlog',
          c.intervalId || ''
        ].join(',');
        csv += row + '\n';
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'board-cards.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Cards CSV export failed', e);
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

/**
 * Pure mapper: GitHub issue -> board card shape.
 * Exported for reuse (e.g. editor standalone GH import) and unit testing.
 * Heuristics:
 *  - Skip PRs
 *  - Type: scan labels for bug/defect->Bug, enhance/feature/story->Story, task/chore->Task, spike->Spike; else first label or 'Story'
 *  - Points: (N), (N pts), [N], Npts from title, fallback body
 */
export function mapGitHubIssueToCard(issue) {
  if (!issue || issue.pull_request) return null;
  const title = String(issue.title || '').trim();
  if (!title) return null;

  // Derive type from labels (scan all for best match); default Story for plain issues
  let type = 'Story';
  const labels = (issue.labels || []).map(l => String((l && l.name) || '').toLowerCase());
  if (labels.some(l => /bug|defect|error|fix/i.test(l))) {
    type = 'Bug';
  } else if (labels.some(l => /enhanc|feature|story|epic|user story/i.test(l))) {
    type = 'Story';
  } else if (labels.some(l => /task|chore|implement/i.test(l))) {
    type = 'Task';
  } else if (labels.some(l => /spike|invest|research|proto/i.test(l))) {
    type = 'Spike';
  } else if (labels.length) {
    const raw = issue.labels[0].name || '';
    if (raw && raw.length <= 24) type = raw;
  }

  // Points: title preferred, then body. Flexible patterns.
  let points = 0;
  let m = title.match(/\((\d+)\s*(?:pts?|points?)?\s*\)/i) ||
          title.match(/\[(\d+)\s*(?:pts?)?\s*\]/i) ||
          title.match(/\b(\d+)\s*pts?\b/i);
  if (m) {
    points = parseInt(m[1], 10) || 0;
  } else if (issue.body) {
    const body = String(issue.body);
    m = body.match(/\((\d+)\s*(?:pts?|points?)?\s*\)/i) ||
        body.match(/\[(\d+)\s*(?:pts?)?\s*\]/i) ||
        body.match(/\b(\d+)\s*pts?\b/i);
    if (m) points = parseInt(m[1], 10) || 0;
  }

  return { title, type, points, blocked: false, status: 'backlog', intervalId: null };
}
