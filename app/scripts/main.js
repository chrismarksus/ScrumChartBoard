import 'skeleton-css/css/skeleton.css';
import '../styles/main.less';
import Helper from './Helper.js';
import GetData from './GetData.js';
import Model from './Model.js';
import Scrum from './Scrum.js';
import Templates from './Templates.js';

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
      window.addEventListener('unload', main.destroy);
    }).catch((err) => {
      console.error(err);
      document.getElementById('main').innerHTML = Templates.nodata({
        'links': urlStorage
      });
    });
  } else {
    document.getElementById('main').innerHTML = Templates.nodata({
      'links': urlStorage
    });
  }
})();
