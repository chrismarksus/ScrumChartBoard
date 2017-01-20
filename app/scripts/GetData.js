class GetData {
  constructor(team, project){
    this.dashboard = `teams/${team}/dashboard.json`;
    this.project = `teams/${team}/projects/${project}/project.json`;
    this.intervals = `teams/${team}/projects/${project}/intervals.json`;
  }
  setup(){
    let promise = $.when(
      $.getJSON(this.dashboard),
      $.getJSON(this.project),
      $.getJSON(this.intervals)
    );
    return promise;
  }
}
