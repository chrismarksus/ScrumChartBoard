// editor.js — vanilla JS JSON editor for the three data files (no jQuery)
// Mirrors the detailed spec from GitHub issue #74.

const state = {
  team: '',
  project: '',
  dashboard: {
    dashboardName: '',
    teamName: '',
    updatedName: '',
    daysInInterval: 10
  },
  projectData: {
    name: '',
    cardTypeLabel: '',
    cardTypes: [],        // [{key, value}]
    cardStatusLabel: '',
    cardStatus: [],       // [{key, value}]
    backlog: '',
    timelines: []         // [{title, timeline: [{label, status, days, start}]}]
  },
  intervals: []           // full interval objects as per DATA_FORMAT (arrays preserved)
};

let currentTab = 'dashboard';

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function updatePreview() {
  const previewEl = $('#preview-json');
  const labelEl = $('#preview-label');
  let data;
  let label = 'Preview';

  if (currentTab === 'dashboard') {
    data = { ...state.dashboard };
    label = 'dashboard.json';
  } else if (currentTab === 'project') {
    data = {
      project: {
        name: state.projectData.name || '',
        cardTypeLabel: state.projectData.cardTypeLabel || undefined,
        cardTypes: arrayToObject(state.projectData.cardTypes),
        cardStatusLabel: state.projectData.cardStatusLabel || undefined,
        cardStatus: arrayToObject(state.projectData.cardStatus),
        backlog: state.projectData.backlog || undefined,
        timelines: state.projectData.timelines.length ? state.projectData.timelines : undefined
      }
    };
    // clean undefined
    Object.keys(data.project).forEach(k => { if (data.project[k] === undefined) delete data.project[k]; });
    label = 'project.json';
  } else if (currentTab === 'intervals') {
    data = { intervals: state.intervals };
    label = 'intervals.json';
  }

  previewEl.textContent = JSON.stringify(data, null, 2);
  labelEl.textContent = label;
}

function arrayToObject(arr) {
  const obj = {};
  (arr || []).forEach(item => {
    if (item && item.key) obj[item.key] = Number(item.value) || 0;
  });
  return obj;
}

function objectToArray(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj).map(k => ({ key: k, value: obj[k] }));
}

function bindInput(id, path) {
  const el = $(`#${id}`);
  if (!el) return;
  el.addEventListener('input', () => {
    const val = el.type === 'number' ? (el.value === '' ? 0 : Number(el.value)) : el.value;
    setPath(state, path, val);
    updatePreview();
  });
}

function setPath(obj, path, val) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length-1]] = val;
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

// --- Repeating helpers ---

function renderKeyValueRepeat(containerId, arrPath, label = 'Item') {
  const container = $(`#${containerId}`);
  if (!container) return;
  container.innerHTML = '';
  const arr = getPath(state, arrPath) || [];
  arr.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'repeat-row';
    row.innerHTML = `
      <input type="text" placeholder="key" value="${item.key || ''}" data-idx="${idx}">
      <input type="number" placeholder="value" value="${item.value || 0}" data-idx="${idx}">
      <button type="button" class="remove-btn" data-idx="${idx}" title="Remove">×</button>
    `;
    const [keyIn, valIn] = row.querySelectorAll('input');
    keyIn.addEventListener('input', () => {
      arr[idx].key = keyIn.value;
      updatePreview();
    });
    valIn.addEventListener('input', () => {
      arr[idx].value = valIn.value === '' ? 0 : Number(valIn.value);
      updatePreview();
    });
    row.querySelector('.remove-btn').addEventListener('click', () => {
      arr.splice(idx, 1);
      renderKeyValueRepeat(containerId, arrPath);
      updatePreview();
    });
    container.appendChild(row);
  });
}

function addKeyValueRepeat(containerId, arrPath) {
  const arr = getPath(state, arrPath);
  if (!Array.isArray(arr)) return;
  arr.push({ key: '', value: 0 });
  renderKeyValueRepeat(containerId, arrPath);
  updatePreview();
}

function renderNumberRepeat(containerId, arrPath) {
  const container = $(`#${containerId}`);
  if (!container) return;
  container.innerHTML = '';
  const arr = getPath(state, arrPath) || [];
  arr.forEach((num, idx) => {
    const row = document.createElement('div');
    row.className = 'repeat-row';
    row.innerHTML = `
      <input type="number" value="${num != null ? num : ''}" data-idx="${idx}">
      <button type="button" class="remove-btn" data-idx="${idx}" title="Remove">×</button>
    `;
    const input = row.querySelector('input');
    input.addEventListener('input', () => {
      arr[idx] = input.value === '' ? 0 : Number(input.value);
      updatePreview();
    });
    row.querySelector('.remove-btn').addEventListener('click', () => {
      arr.splice(idx, 1);
      renderNumberRepeat(containerId, arrPath);
      updatePreview();
    });
    container.appendChild(row);
  });
}

function addNumberRepeat(containerId, arrPath) {
  const arr = getPath(state, arrPath);
  if (!Array.isArray(arr)) return;
  arr.push(0);
  renderNumberRepeat(containerId, arrPath);
  updatePreview();
}

// --- Timelines (nested) ---

function renderTimelines() {
  const container = $('#p-timelines-container');
  if (!container) return;
  container.innerHTML = '';
  state.projectData.timelines.forEach((tl, tIdx) => {
    const block = document.createElement('div');
    block.className = 'collapsible';
    block.innerHTML = `
      <details open>
        <summary>
          Timeline ${tIdx + 1}: <input type="text" value="${tl.title || ''}" style="width:180px; display:inline;" data-tidx="${tIdx}">
          <button type="button" class="remove-btn" data-tidx="${tIdx}" style="float:right;">×</button>
        </summary>
        <div class="collapsible-body">
          <div data-timeline-items="${tIdx}"></div>
          <button type="button" class="button add-btn" data-add-timeline-item="${tIdx}">+ Add Theme</button>
        </div>
      </details>
    `;
    const titleIn = block.querySelector('input');
    titleIn.addEventListener('input', () => {
      state.projectData.timelines[tIdx].title = titleIn.value;
      updatePreview();
    });
    block.querySelector('.remove-btn').addEventListener('click', (e) => {
      e.preventDefault();
      state.projectData.timelines.splice(tIdx, 1);
      renderTimelines();
      updatePreview();
    });
    container.appendChild(block);
    renderTimelineItems(tIdx, block.querySelector(`[data-timeline-items="${tIdx}"]`));
    block.querySelector(`[data-add-timeline-item="${tIdx}"]`).addEventListener('click', () => {
      if (!state.projectData.timelines[tIdx].timeline) state.projectData.timelines[tIdx].timeline = [];
      state.projectData.timelines[tIdx].timeline.push({ label: '', status: 'todo', days: 0, start: 0 });
      renderTimelines();
      updatePreview();
    });
  });
}

function renderTimelineItems(tIdx, container) {
  container.innerHTML = '';
  const items = state.projectData.timelines[tIdx].timeline || [];
  items.forEach((item, iIdx) => {
    const row = document.createElement('div');
    row.className = 'repeat-row';
    row.style.flexWrap = 'wrap';
    row.innerHTML = `
      <input type="text" placeholder="label" value="${item.label || ''}" style="flex:2 1 140px;">
      <select style="flex:1 1 80px;">
        <option value="todo">todo</option>
        <option value="inprogress">inprogress</option>
        <option value="done">done</option>
      </select>
      <input type="number" placeholder="days" value="${item.days || 0}" style="width:70px;">
      <input type="number" placeholder="start" value="${item.start || 0}" style="width:70px;">
      <button type="button" class="remove-btn" title="Remove">×</button>
    `;
    const [labelIn, statusSel, daysIn, startIn] = row.querySelectorAll('input,select');
    labelIn.addEventListener('input', () => { items[iIdx].label = labelIn.value; updatePreview(); });
    statusSel.value = item.status || 'todo';
    statusSel.addEventListener('change', () => { items[iIdx].status = statusSel.value; updatePreview(); });
    daysIn.addEventListener('input', () => { items[iIdx].days = Number(daysIn.value)||0; updatePreview(); });
    startIn.addEventListener('input', () => { items[iIdx].start = Number(startIn.value)||0; updatePreview(); });
    row.querySelector('.remove-btn').addEventListener('click', () => {
      items.splice(iIdx, 1);
      renderTimelines();
      updatePreview();
    });
    container.appendChild(row);
  });
}

function addTimeline() {
  state.projectData.timelines.push({ title: '', timeline: [] });
  renderTimelines();
  updatePreview();
}

// --- Intervals (complex) ---

function renderIntervals() {
  const container = $('#intervals-container');
  if (!container) return;
  container.innerHTML = '';
  state.intervals.forEach((iv, idx) => {
    const det = document.createElement('div');
    det.className = 'collapsible';
    const summaryText = `${iv.label || 'New Interval'} — ${iv.dateStart || ''} to ${iv.dateEnd || ''}`;
    det.innerHTML = `
      <details>
        <summary>
          ${summaryText}
          <button type="button" class="remove-btn" data-iidx="${idx}" style="float:right; margin-top:-2px;">×</button>
        </summary>
        <div class="collapsible-body" data-iv-body="${idx}">
          <!-- populated by JS -->
        </div>
      </details>
    `;
    const removeBtn = det.querySelector('.remove-btn');
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.intervals.splice(idx, 1);
      renderIntervals();
      updatePreview();
    });
    container.appendChild(det);
    renderIntervalBody(idx, det.querySelector(`[data-iv-body="${idx}"]`));
  });
}

function renderIntervalBody(idx, body) {
  body.innerHTML = '';
  const iv = state.intervals[idx];
  const fields = [
    ['label', 'text', 'Label'],
    ['review', 'text', 'Review URL (opt)'],
    ['dateStart', 'text', 'dateStart (mm/dd/yyyy)'],
    ['dateEnd', 'text', 'dateEnd (mm/dd/yyyy)'],
    ['teamMembersCount', 'number', 'teamMembersCount'],
    ['pointsCommited', 'number', 'pointsCommited'],
    ['pointsCompleted', 'number', 'pointsCompleted'],
    ['pointsEstimated', 'number', 'pointsEstimated'],
    ['cardsCommited', 'number', 'cardsCommited'],
    ['cardsCompleted', 'number', 'cardsCompleted'],
    ['cardsEstimated', 'number', 'cardsEstimated'],
    ['cardsUnestimated', 'number', 'cardsUnestimated'],
    ['cardsBlocked', 'number', 'cardsBlocked'],
    ['daysOutHolidays', 'number', 'daysOutHolidays'],
    ['issuesPerInterval', 'number', 'issuesPerInterval'],
    ['notesInterval', 'text', 'notesInterval (opt)']
  ];

  fields.forEach(([key, type, label]) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<label style="margin-top:8px;">${label}</label><input data-iv-key="${key}" type="${type}" value="${iv[key] != null ? iv[key] : ''}">`;
    const input = wrap.querySelector('input');
    input.addEventListener('input', () => {
      iv[key] = type === 'number' ? (input.value==='' ? 0 : Number(input.value)) : input.value;
      updatePreview();
    });
    body.appendChild(wrap);
  });

  // Repeating number arrays
  const repeats = [
    ['satisfactionTeam', 'Satisfaction Team (scores)'],
    ['satisfactionShareholders', 'Satisfaction Shareholders (scores)'],
    ['daysTimebox', 'Days Timebox'],
    ['daysOutPlanned', 'Days Out Planned'],
    ['daysOutUnplanned', 'Days Out Unplanned']
  ];
  repeats.forEach(([key, label]) => {
    if (!Array.isArray(iv[key])) iv[key] = [];
    const sec = document.createElement('div');
    sec.className = 'repeat-section';
    sec.innerHTML = `<label>${label}</label><div data-repeat-iv="${key}-${idx}"></div>`;
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'button add-btn';
    add.textContent = '+ Add';
    add.addEventListener('click', () => {
      iv[key].push(0);
      renderNumberRepeatForInterval(sec.querySelector(`[data-repeat-iv="${key}-${idx}"]`), iv[key], idx, key);
      updatePreview();
    });
    sec.appendChild(add);
    body.appendChild(sec);
    renderNumberRepeatForInterval(sec.querySelector(`[data-repeat-iv="${key}-${idx}"]`), iv[key], idx, key);
  });
}

function renderNumberRepeatForInterval(container, arr, ivIdx, key) {
  container.innerHTML = '';
  arr.forEach((val, vIdx) => {
    const r = document.createElement('div');
    r.className = 'repeat-row';
    r.innerHTML = `<input type="number" value="${val != null ? val : ''}"><button type="button" class="remove-btn">×</button>`;
    const inp = r.querySelector('input');
    inp.addEventListener('input', () => { arr[vIdx] = inp.value===''?0:Number(inp.value); updatePreview(); });
    r.querySelector('.remove-btn').addEventListener('click', () => {
      arr.splice(vIdx, 1);
      renderNumberRepeatForInterval(container, arr, ivIdx, key);
      updatePreview();
    });
    container.appendChild(r);
  });
}

function addInterval() {
  state.intervals.push({
    label: 'New Interval',
    dateStart: '',
    dateEnd: '',
    teamMembersCount: 0,
    satisfactionTeam: [],
    satisfactionShareholders: [],
    pointsCommited: 0,
    pointsCompleted: 0,
    pointsEstimated: 0,
    cardsCommited: 0,
    cardsCompleted: 0,
    cardsEstimated: 0,
    cardsUnestimated: 0,
    cardsBlocked: 0,
    daysTimebox: [],
    daysOutHolidays: 0,
    daysOutPlanned: [],
    daysOutUnplanned: [],
    issuesPerInterval: 0,
    notesInterval: ''
  });
  renderIntervals();
  updatePreview();
}

// --- Tab handling ---

function switchTab(tab) {
  currentTab = tab;
  $$('.editor-tab-btn').forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
  $$('.editor-pane').forEach(p => p.classList.toggle('is-active', p.id === `pane-${tab}`));
  updatePreview();
}

function bindTabs() {
  $$('.editor-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

// --- Load / init ---

async function loadData() {
  const team = $('#team-input').value.trim();
  const project = $('#project-input').value.trim();
  if (!team || !project) {
    $('#load-status').textContent = 'Team and project required';
    return;
  }
  state.team = team;
  state.project = project;
  $('#load-status').textContent = 'Loading...';

  try {
    const base = `/teams/${encodeURIComponent(team)}/projects/${encodeURIComponent(project)}/`;
    const [dashRes, projRes, intRes] = await Promise.all([
      fetch(`/teams/${encodeURIComponent(team)}/dashboard.json`),
      fetch(base + 'project.json'),
      fetch(base + 'intervals.json')
    ]);

    if (!dashRes.ok) throw new Error('dashboard not found');
    const dash = await dashRes.json();

    state.dashboard = {
      dashboardName: dash.dashboardName || '',
      teamName: dash.teamName || '',
      updatedName: dash.updatedName || '',
      daysInInterval: dash.daysInInterval || 10
    };

    let proj = {};
    if (projRes.ok) {
      const p = await projRes.json();
      proj = p.project || {};
    }
    state.projectData = {
      name: proj.name || '',
      cardTypeLabel: proj.cardTypeLabel || '',
      cardTypes: objectToArray(proj.cardTypes),
      cardStatusLabel: proj.cardStatusLabel || '',
      cardStatus: objectToArray(proj.cardStatus),
      backlog: proj.backlog || '',
      timelines: (proj.timelines || []).map(t => ({
        title: t.title || '',
        timeline: (t.timeline || []).map(it => ({...it}))
      }))
    };

    let ints = [];
    if (intRes.ok) {
      const i = await intRes.json();
      ints = (i.intervals || []).map(iv => ({...iv}));
    }
    state.intervals = ints;

    renderAllForms();
    updatePreview();
    $('#load-status').textContent = 'Loaded ✓ (copy JSONs to your teams/ folder)';
  } catch (e) {
    console.warn(e);
    // start blank
    state.dashboard = { dashboardName: '', teamName: '', updatedName: '', daysInInterval: 10 };
    state.projectData = { name: '', cardTypeLabel: '', cardTypes: [], cardStatusLabel: '', cardStatus: [], backlog: '', timelines: [] };
    state.intervals = [];
    renderAllForms();
    updatePreview();
    $('#load-status').textContent = 'No data or error — starting blank form';
  }
}

function renderAllForms() {
  // dashboard
  $('#d-dashboardName').value = state.dashboard.dashboardName || '';
  $('#d-teamName').value = state.dashboard.teamName || '';
  $('#d-updatedName').value = state.dashboard.updatedName || '';
  $('#d-daysInInterval').value = state.dashboard.daysInInterval || 10;

  // project scalars
  $('#p-name').value = state.projectData.name || '';
  $('#p-cardTypeLabel').value = state.projectData.cardTypeLabel || '';
  $('#p-cardStatusLabel').value = state.projectData.cardStatusLabel || '';
  $('#p-backlog').value = state.projectData.backlog || '';

  // repeats
  renderKeyValueRepeat('p-cardTypes-container', 'projectData.cardTypes');
  renderKeyValueRepeat('p-cardStatus-container', 'projectData.cardStatus');
  renderTimelines();

  // intervals
  renderIntervals();

  // rebind simple inputs (in case)
  bindSimpleInputs();
}

function bindSimpleInputs() {
  // Dashboard
  bindInput('d-dashboardName', 'dashboard.dashboardName');
  bindInput('d-teamName', 'dashboard.teamName');
  bindInput('d-updatedName', 'dashboard.updatedName');
  bindInput('d-daysInInterval', 'dashboard.daysInInterval');

  // Project
  bindInput('p-name', 'projectData.name');
  bindInput('p-cardTypeLabel', 'projectData.cardTypeLabel');
  bindInput('p-cardStatusLabel', 'projectData.cardStatusLabel');
  bindInput('p-backlog', 'projectData.backlog');
}

function bindAddButtons() {
  // card types/status
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-add="p-cardTypes"]')) addKeyValueRepeat('p-cardTypes-container', 'projectData.cardTypes');
    if (e.target.matches('[data-add="p-cardStatus"]')) addKeyValueRepeat('p-cardStatus-container', 'projectData.cardStatus');
    if (e.target.matches('[data-add="p-timelines"]')) addTimeline();
    if (e.target.matches('[data-add="interval"]')) addInterval();
  });

  // copy buttons
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-copy]')) {
      const section = e.target.getAttribute('data-copy');
      let toCopy;
      if (section === 'dashboard') toCopy = { ...state.dashboard };
      else if (section === 'project') {
        toCopy = { project: {
          name: state.projectData.name,
          cardTypeLabel: state.projectData.cardTypeLabel || undefined,
          cardTypes: arrayToObject(state.projectData.cardTypes),
          cardStatusLabel: state.projectData.cardStatusLabel || undefined,
          cardStatus: arrayToObject(state.projectData.cardStatus),
          backlog: state.projectData.backlog || undefined,
          timelines: state.projectData.timelines.length ? state.projectData.timelines : undefined
        }};
        Object.keys(toCopy.project).forEach(k => toCopy.project[k]===undefined && delete toCopy.project[k]);
      } else if (section === 'intervals') {
        toCopy = { intervals: state.intervals };
      }
      navigator.clipboard.writeText(JSON.stringify(toCopy, null, 2)).then(() => {
        const orig = e.target.textContent;
        e.target.textContent = 'Copied!';
        setTimeout(() => e.target.textContent = orig, 1200);
      });
    }
    if (e.target.id === 'copy-preview-btn') {
      const txt = $('#preview-json').textContent;
      navigator.clipboard.writeText(txt);
      const orig = e.target.textContent;
      e.target.textContent = 'Copied!';
      setTimeout(() => e.target.textContent = orig, 1200);
    }
  });
}

function initFromQuery() {
  const params = new URLSearchParams(location.search);
  const t = params.get('team');
  const p = params.get('project');
  if (t) $('#team-input').value = t;
  if (p) $('#project-input').value = p;
  if (t && p) {
    // auto load for convenience
    setTimeout(() => loadData(), 50);
  }
}

function init() {
  // bind load
  $('#load-btn').addEventListener('click', loadData);

  bindTabs();
  bindAddButtons();

  // initial blank forms
  renderAllForms();
  bindSimpleInputs();
  updatePreview();

  initFromQuery();

  // allow Enter in top inputs to load
  ['#team-input', '#project-input'].forEach(sel => {
    const el = $(sel);
    if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadData(); });
  });

  // live preview on tab switch already handled
  console.log('[editor] ready (vanilla, no jQuery)');
}

init();