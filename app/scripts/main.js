(function () {
  let helper = new Helper();
  let team = helper.queryString('team');
  let project = helper.queryString('project');
  let urlStorage = localStorage.getItem('scrum_url_data_0001');
  if(urlStorage){
    urlStorage = $.parseJSON(urlStorage);
  } else {
    urlStorage = [];
  }
  let isTeamAndProjectInStorage = urlStorage.some(function (item){
    return (item.team === team && item.project === project);
  });
  if(team && project){
    if(!isTeamAndProjectInStorage){
      urlStorage.push({ 'team': team, 'project': project });
      localStorage.setItem('scrum_url_data_0001', JSON.stringify(urlStorage));
    }
    let getData = new GetData(team, project);
    getData.setup().done((dashboard, project, intervals) => {
      let board = dashboard[0];

      let lastModifiedIntervals = intervals[2].getResponseHeader('Last-Modified');
      let dateIntervals = new Date(lastModifiedIntervals);

      let lastModifiedProject = project[2].getResponseHeader('Last-Modified');
      let dateProject = new Date(lastModifiedProject);

      if(dateIntervals > dateProject){
        board.updatedDate = helper.mmddyyyy(lastModifiedIntervals);
      } else if(dateIntervals <= dateProject){
        board.updatedDate = helper.mmddyyyy(lastModifiedProject);
      }

      board.project = project[0].project;
      board.intervals = intervals[0].intervals;

      let model = new Model(board);
      let main = new Scrum('main', model);
      main.setup();
      window.addEventListener('unload', main.destroy);
    }).fail((err) => {
      console.error(err);
      $('#main').html(App.templates.nodata({
        'links': urlStorage
      }));
    });
  } else {
    $('#main').html(App.templates.nodata({
      'links': urlStorage
    }));
  }
})();
