import '../styles/main.css';
import ThemeSwitcher from './ThemeSwitcher.js';
import Helper from './Helper.js';
import GetData from './GetData.js';
import Model from './Model.js';
import Scrum from './Scrum.js';
import Templates from './Templates.js';
import Store from './Store.js';
import Board from './Board.js';
import IntervalPlanner from './IntervalPlanner.js';
import TimelineEditor from './TimelineEditor.js';
import BoardAdapter from './BoardAdapter.js';

new ThemeSwitcher().setup();

let board = null;
let planner = null;
let timeline = null;

function setActiveTab(tab) {
  const btns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  btns.forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
  panels.forEach(p => { p.hidden = p.id !== `panel-${tab}`; });
  if (tab === 'board' && board) board.render('panel-board');
  if (tab === 'planner' && planner) planner.render('panel-planner');
  if (tab === 'timeline' && timeline) timeline.render('panel-timeline');
}

// Tab switching (URL reflects active tab per spec.main_tabbar.md; ?tab= coexists with team/project/apiBase)
(function () {
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      setActiveTab(tab);
      try {
        const url = new URL(location.href);
        url.searchParams.set('tab', tab);
        history.pushState({}, '', url);
      } catch (e) {}
    });
  });
})();

// Initial tab from ?tab= (takes precedence) or the hardcoded active in HTML.
// Applied early for correct initial panel visibility (no FOUC), before components exist.
(function initTabFromUrl() {
  const h = new Helper();
  let tab = h.queryString('tab');
  if (!tab) {
    const active = document.querySelector('.tab-btn.is-active');
    tab = active ? active.dataset.tab : 'dashboard';
  }
  // Apply classes only (component renders guarded inside setActiveTab)
  const btns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  btns.forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
  panels.forEach(p => { p.hidden = p.id !== `panel-${tab}`; });
})();

(function () {
  const helper = new Helper();
  const team = helper.queryString('team');
  const project = helper.queryString('project');
  // Wire Store.apiBase from query param (for self-host server sync, e.g. ?apiBase=http://localhost:3001)
  // Persist last-used so it survives reloads; query always wins for this visit.
  try {
    const qApi = helper.queryString('apiBase');
    if (qApi) {
      Store.apiBase = qApi;
      localStorage.setItem('scrum_api_base_0001', qApi);
    } else {
      const saved = localStorage.getItem('scrum_api_base_0001');
      if (saved) Store.apiBase = saved;
    }
  } catch {}
  let urlStorage = localStorage.getItem('scrum_url_data_0001');
  if(urlStorage){
    urlStorage = JSON.parse(urlStorage);
  } else {
    urlStorage = [];
  }
  const isTeamAndProjectInStorage = urlStorage.some(function (item){
    return (item.team === team && item.project === project);
  });
  if(team && project){
    const store = new Store(team, project);
    store.sync().then(() => {
      board = new Board(store);
      board.render('panel-board');
      planner = new IntervalPlanner(store);
      planner.render('panel-planner');
      timeline = new TimelineEditor(store);
      timeline.render('panel-timeline');

      // Small persisted UI surface: show sync badge when apiBase is configured (query or saved)
      if (Store.apiBase) {
        const brand = document.querySelector('.brand');
        if (brand && !document.getElementById('api-base-badge')) {
          const badge = document.createElement('span');
          badge.id = 'api-base-badge';
          badge.style.cssText = 'font-family:var(--font-mono);font-size:9px;margin-left:6px;padding:1px 5px;border:1px solid var(--border);border-radius:3px;color:var(--text-muted);';
          const short = Store.apiBase.replace(/^https?:\/\//, '').replace(/\/$/, '');
          badge.textContent = '🔗 ' + short;
          badge.title = 'Board sync target (set via ?apiBase=... or persisted). Changes auto-POST to server.';
          brand.appendChild(badge);
        }
      }

      // Re-apply ?tab= now that the interactive components exist. This ensures the
      // correct panel is shown and the component's render() has run for direct links.
      const desiredTab = helper.queryString('tab') || 'dashboard';
      setActiveTab(desiredTab);
    });

    if(!isTeamAndProjectInStorage){
      urlStorage.push({ 'team': team, 'project': project });
      localStorage.setItem('scrum_url_data_0001', JSON.stringify(urlStorage));
    }
    const getData = new GetData(team, project);
    getData.setup().then(([dashboard, project, intervals]) => {
      let modelInput = dashboard[0];

      const lastModifiedIntervals = intervals[1].headers.get('Last-Modified');
      const dateIntervals = new Date(lastModifiedIntervals);

      const lastModifiedProject = project[1].headers.get('Last-Modified');
      const dateProject = new Date(lastModifiedProject);

      if(dateIntervals > dateProject){
        modelInput.updatedDate = helper.mmddyyyy(lastModifiedIntervals);
      } else if(dateIntervals <= dateProject){
        modelInput.updatedDate = helper.mmddyyyy(lastModifiedProject);
      }

      modelInput.project = project[0].project;
      modelInput.intervals = intervals[0].intervals;

      // Phase 0: BoardAdapter - if the interactive board has data (cards, intervals, or timelines),
      // derive/enrich the dashboard data from it so charts reflect live board state.
      // This is the key unification: create/edit via editor + board/CSV, see rich charts.
      try {
        const storeSnapshot = {
          cards: store.getCards(),
          intervals: store.getIntervals(),
          timelines: store.getTimelines()
        };
        const hasBoardData = (storeSnapshot.cards && storeSnapshot.cards.length > 0) ||
                             (storeSnapshot.intervals && storeSnapshot.intervals.length > 0) ||
                             (storeSnapshot.timelines && storeSnapshot.timelines.length > 0);
        if (hasBoardData) {
          modelInput = BoardAdapter.toDashboardData(storeSnapshot, modelInput);
        }
      } catch (e) {
        console.warn('BoardAdapter failed, falling back to JSON data', e);
      }

      const model = new Model(modelInput);
      const main = new Scrum('main', model);
      main.setup();
      window.addEventListener('pagehide', main.destroy);
    }).catch((err) => {
      console.error(err);
      document.getElementById('main').innerHTML = Templates.nodata({
        'links': urlStorage
      });
    });
  } else {
    window.location.replace('./index.html');
  }
})();
