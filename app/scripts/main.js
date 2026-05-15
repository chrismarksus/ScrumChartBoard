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

new ThemeSwitcher().setup();

(function () {
  const helper = new Helper();
  const team = helper.queryString('team');
  const project = helper.queryString('project');

  let urlStorage = localStorage.getItem('scrum_url_data_0001');
  if (urlStorage) {
    urlStorage = JSON.parse(urlStorage);
  } else {
    urlStorage = [];
  }
  const inStorage = urlStorage.some(i => i.team === team && i.project === project);
  if (team && project && !inStorage) {
    urlStorage.push({ team, project });
    localStorage.setItem('scrum_url_data_0001', JSON.stringify(urlStorage));
  }

  if (!team || !project) {
    window.location.replace('./landing.html');
    return;
  }

  // Board tabs — always available
  const store = new Store(team, project);
  new Board('tab-board', store).render();
  new IntervalPlanner('tab-planner', store).render();
  new TimelineEditor('tab-timeline', store).render();

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Dashboard — loads from JSON files
  const getData = new GetData(team, project);
  getData.setup().then(([dashboard, projectData, intervals]) => {
    const board = dashboard[0];

    const lastModifiedIntervals = intervals[1].headers.get('Last-Modified');
    const dateIntervals = new Date(lastModifiedIntervals);
    const lastModifiedProject = projectData[1].headers.get('Last-Modified');
    const dateProject = new Date(lastModifiedProject);

    if (dateIntervals > dateProject) {
      board.updatedDate = helper.mmddyyyy(lastModifiedIntervals);
    } else {
      board.updatedDate = helper.mmddyyyy(lastModifiedProject);
    }

    board.project = projectData[0].project;
    board.intervals = intervals[0].intervals;

    const model = new Model(board);
    const scrum = new Scrum('tab-dashboard', model);
    scrum.setup();
    window.addEventListener('unload', scrum.destroy);
  }).catch(err => {
    console.error(err);
    document.getElementById('tab-dashboard').innerHTML = Templates.nodata({ links: urlStorage });
  });
})();
