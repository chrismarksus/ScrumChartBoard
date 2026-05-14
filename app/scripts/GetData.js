class GetData {
  constructor(team, project){
    this.dashboard = `teams/${team}/dashboard.json`;
    this.project = `teams/${team}/projects/${project}/project.json`;
    this.intervals = `teams/${team}/projects/${project}/intervals.json`;
  }
  fetchJson(url){
    return fetch(url).then(response => {
      if(!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      return response.json().then(data => [data, response]);
    });
  }
  setup(){
    return Promise.all([
      this.fetchJson(this.dashboard),
      this.fetchJson(this.project),
      this.fetchJson(this.intervals)
    ]);
  }
}
