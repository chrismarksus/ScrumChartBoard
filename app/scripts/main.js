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

let board = null;
let planner = null;
let timeline = null;

// Tab switching
(function () {
  const btns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.toggle('is-active', b === btn));
      panels.forEach(p => { p.hidden = p.id !== `panel-${btn.dataset.tab}`; });
      if (btn.dataset.tab === 'board' && board) board.render('panel-board');
      if (btn.dataset.tab === 'planner' && planner) planner.render('panel-planner');
      if (btn.dataset.tab === 'timeline' && timeline) timeline.render('panel-timeline');
    });
  });
})();

(function () {
  const helper = new Helper();
  const team = helper.queryString('team');
  const project = helper.queryString('project');
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
    });

    if(!isTeamAndProjectInStorage){
      urlStorage.push({ 'team': team, 'project': project });
      localStorage.setItem('scrum_url_data_0001', JSON.stringify(urlStorage));
    }
    const getData = new GetData(team, project);
    getData.setup().then(([dashboard, project, intervals]) => {
      const board = dashboard[0];

      const lastModifiedIntervals = intervals[1].headers.get('Last-Modified');
      const dateIntervals = new Date(lastModifiedIntervals);

      const lastModifiedProject = project[1].headers.get('Last-Modified');
      const dateProject = new Date(lastModifiedProject);

      if(dateIntervals > dateProject){
        board.updatedDate = helper.mmddyyyy(lastModifiedIntervals);
      } else if(dateIntervals <= dateProject){
        board.updatedDate = helper.mmddyyyy(lastModifiedProject);
      }

      board.project = project[0].project;
      board.intervals = intervals[0].intervals;

      const model = new Model(board);
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
    window.location.replace('./landing.html');
  }
})();
