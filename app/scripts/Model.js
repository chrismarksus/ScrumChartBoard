class Model{
  constructor(data = {}, change = () => {}){
    this.d = data;
    this.onChange = change;
    this.popups = [
      {
        'label': 'burndown',
        'title': 'Burnup',
        'content': 'Display the scope of the project in story point. Then the point that the team has completed up through the previous sprint. There is also a projection line to predict a completion forecast in terms of sprints.'
      },
      {
        'label': 'timelines',
        'title': 'Timelines',
        'content': 'This represents a large group of work to complete <em>(Ex. releases, themes, or epics)</em> and shows progress toward completion.'
      },
      {
        'label': 'status',
        'title': 'Status',
        'content': 'This is the status of the project in term of cards completed, todo and in progress.'
      },
      {
        'label': 'commitedvscompleted',
        'title': 'Commited <small>VS</small> Completed (Points)',
        'content': 'The teams commits to a number of story points and completes point in the sprint. This display the trend for committed to completion.'
      },
      {
        'label': 'pointsgoals',
        'title': 'Sprint Goals (Points)',
        'content': 'This is the percentage of points completed and committed. We want to aim for 100%. Plus or minus 10% to 15% is acceptable. High and more points should be added to the sprint. Low and fewer points should be added to the sprint.'
      },
      {
        'label': 'cardscommitedvscompleted',
        'title': 'Commited <small>VS</small> Completed (Cards)',
        'content': 'The teams commits to a number of story cards and completed cards in a sprint. This display the trend for committed to completion.'
      },
      {
        'label': 'cardsgoals',
        'title': 'Sprint Goals (Cards)',
        'content': 'This is the percentage of points completed and committed. We want to aim for 100%. Plus or minus 10% to 15% is acceptable. High and more points should be added to the sprint.'
      },
      {
        'label': 'type',
        'title': 'Card Type',
        'content': 'These are the types of cards by amount <em>(not points)</em>. Trends in projects can monitored and determine with this chart. A large number of spikes or non-story cards may indicate too many unknowns in the project. High defect density may indicate the team is move too fast and needs to better understand the sprint goals.'
      },
      {
        'label': 'daysWorked',
        'title': 'Capacity',
        'content': 'This is a predicted work capacity. The holidays and vacations days are calculated against the velocity. This will figure out the number of person work days but also the velocity that can be achieved with the person work days available for a sprint. Red is the next sprint. Blue is the current sprint green are previous sprints.'
      },
      {
        'label': 'capacityDays',
        'title': 'Capacity (#)',
        'content': 'This displays the total workday in the title. The toal person work days and the estimated velocity base on the work days.'
      },
      {
        'label': 'velocity',
        'title': 'Velocity',
        'content': 'The teams current velocity base on the last 3 completed sprints.'
      },
      {
        'label': 'satisfaction',
        'title': 'Satisfaction',
        'content': 'Each team member rates the sprint as to how satisfied they are with the previous sprint. This is averaged by votes. Absent members are not counted. This is done during the retrospective. The rating is from one to ten. Ten is the sprint to set all future sprints by and one is the worst sprint ever!'
      },
      {
        'label': 'cards',
        'title': 'Cards (#)',
        'content': 'The total number of cards is represented in the title. The total number of cards that have an estimated vs the number of cards that do not have an estimate. This will indicate the confidence level you should have in the projection data.'
      },
      {
        'label': 'issuesPerInterval',
        'title': 'Issues Per Interval',
        'content': 'This is the number of problem that occur within a sprint.'
      },
      {
        'label': 'cardsBlocked',
        'title': 'Blocked Cards Per Sprint',
        'content': 'This is the number of card blocked during the sprint. This is one card blocked one time. A card blocked multiple time will be counted each time'
      }
    ];
  }
  data(data){
    let newData = this.d;
    if(data){
      newData = data;
      this.d = newData;
      this.onChange(newData);
    }
    return newData;
  }
  title(){
    return `${this.d.project.name} (${this.d.teamName})`;
  }
  totalAverageVelocity(){
    let arr = this.d.intervals.map(i => {
      return i.pointsCompleted;
    });
    let data = arr.reduce((total, cur) => { return total + cur; }) / arr.length;
    return Math.round(data);
  }
  cardsEstimated(label = 'none'){
    const i = this.findByIntervalLabel(label);
    if(i.cardsEstimated && i.cardsUnestimated && typeof i.cardsEstimated === 'number' && typeof i.cardsUnestimated === 'number'){
      return (i.cardsEstimated - i.cardsUnestimated);
    }
    return 0;
  }
  cardsUnestimated(label){
    const i = this.findByIntervalLabel(label);
    if(typeof i.cardsUnestimated === 'number'){
      return i.cardsUnestimated;
    }
    return 0;
  }
  cardsTotal(label){
    const i = this.findByIntervalLabel(label);
    if(i.cardsEstimated && typeof i.cardsEstimated === 'number'){
      return i.cardsEstimated;
    }
    return 0;
  }
  totalPersonWorkDays(label){
    const i = this.findByIntervalLabel(label);
    return i.teamMembersCount * this.d.daysInInterval;
  }
  personWorkDays(label){
    const d = this.d;
    const i = this.findByIntervalLabel(label);
    const total = i.teamMembersCount * this.d.daysInInterval;
    const t = i.daysTimebox.reduce(this.addUp);
    const h = (i.daysOutHolidays * i.teamMembersCount);
    const p = i.daysOutPlanned.reduce(this.addUp);
    const u = i.daysOutUnplanned.reduce(this.addUp);
    return total - (t + h + p + u);
  }
  timeboxes(label){
    const i = this.findByIntervalLabel(label);
    return i.daysTimebox.reduce(this.addUp);
  }
  predictedVelocity(totalpersonWorkDays, personWorkDays, velocity){
    return Math.floor((velocity/totalpersonWorkDays) * personWorkDays);
  }
  findByIntervalLabel(label){
    return this.d.intervals.find(i => {
      return (i.label == label);
    });
  }
  addUp(total, number){
    return (total + number);
  }
  findPropReduceByNameAverageByLength(name, data){
    const arr = data[name];
    let result = 0;
    if (arr && arr.length) {
      result = arr.reduce(this.addUp) / arr.length;
    }
    return result;
  }
  getObjectPropInArrayByName(name, arr){
    let obj = {};
    if(typeof name === 'string') {
      obj[name] = arr.map((a) => {
        return a[name];
      });
    } else if(typeof name === 'object') {
      name.forEach((n) => {
        obj[n] = arr.map((a) => {
          return a[n];
        });
      });
    }
    return obj;
  }
  getObjectPropInArrayByNameOrNull(name, arr){
    let obj = {};
    if(typeof name === 'string') {
      obj[name] = arr.map((a) => {
        return a[name] || null;
      });
    }
    return obj;
  }
  satisfaction(){
    let team = this.d.intervals.map((i) => {
      return this.findPropReduceByNameAverageByLength('satisfactionTeam',i);
    });
    let shareholders = this.d.intervals.map((i) => {
      return this.findPropReduceByNameAverageByLength('satisfactionShareholders',i);
    });
    return [{
      'label': 'team',
      'scores': team
    },{
      'label': 'shareholder',
      'scores': shareholders
    }];
  }
  dashboard(label){
    const helper = new Helper();
    let data = {};
    data.intervals = this.d.intervals;
    data.dashboardName = this.d.dashboardName;
    data.projectName = this.d.project.name;
    data.teamName = this.d.teamName;
    if(this.d.project.timelines && this.d.project.timelines.length > 0){
      data.timelines = this.d.project.timelines.map((item, index) => {
        return {'title': item.title, 'label': `timeline_${index}`};
      })
    }
    if(this.d.project.backlog){
      data.backlog = this.d.project.backlog;
    }
    if(this.d.updatedName && this.d.updatedDate){
      data.updatedName = this.d.updatedName;
      data.updatedDate = helper.mmddyyyy(this.d.updatedDate);
    }
    data.daysInInterval = this.d.daysInInterval;
    data.totalAverageVelocity = this.totalAverageVelocity();
    data.cardsEstimated = this.cardsEstimated(label);
    data.cardsUnestimated = this.cardsUnestimated(label);
    data.cardsTotal = this.cardsTotal(label);
    data.personWorkDays = this.personWorkDays(label);
    data.timeboxes = this.timeboxes(label);
    data.totalPersonWorkDays = this.totalPersonWorkDays(label);
    data.predictedVelocity = this.predictedVelocity(
      data.totalPersonWorkDays,
      data.personWorkDays,
      data.totalAverageVelocity);
    data.popups = this.popups;
    return data;
  }
  capacity(){
    let data = this.getObjectPropInArrayByName([
      'daysTimebox'     ,
      'daysOutHolidays' ,
      'daysOutPlanned'  ,
      'daysOutUnplanned',
      'teamMembersCount'],
      this.d.intervals
    );
    data.daysOutHolidays.map((i) => {
      return i.teamMembersCount * i.daysOutHolidays;
    });
    data.daysTimebox.reduce(this.addUp);
    let dop = data.daysOutPlanned.map((item) => {
      let result  = item.reduce((pre, cur) => { return pre + cur; });
      return result;
    });
    data.daysOutPlanned = dop;
    let dup = data.daysOutUnplanned.map((item) => {
      return item.reduce((pre, cur) => { return pre + cur; });
    });
    data.daysOutUnplanned = dup;
    data.daysTimebox = [].concat.apply([], data.daysTimebox);
    let daysWorked = [];
    data.daysTimebox.forEach((item, index) => {
      daysWorked.push((data.teamMembersCount[index] * this.d.daysInInterval) - (
        parseInt(data.daysTimebox[index],10) +
        parseInt(data.daysOutHolidays[index],10) +
        parseInt(data.daysOutPlanned[index],10) +
        parseInt(data.daysOutUnplanned[index],10)));
    });
    data.daysWorked = daysWorked;
    if(data.daysTimebox.reduce(this.addUp) === 0){
      delete data.daysTimebox;
    }
    if(data.daysOutPlanned.reduce(this.addUp) === 0){
      delete data.daysOutPlanned;
    }
    if(data.daysOutUnplanned.reduce(this.addUp) === 0){
      delete data.daysOutUnplanned;
    }
    if(data.daysOutHolidays.reduce(this.addUp) === 0){
      delete data.daysOutHolidays;
    }
    delete data.teamMembersCount;
    return data;
  }
  intervalData(){
    let table = this.getObjectPropInArrayByName([
      'issuesPerInterval',
      'cardsBlocked',
      'cardsEstimated',
      'cardsCompleted',
      'cardsCommited',
      'pointsCompleted',
      'pointsCommited',
      'pointsEstimated',
      'label',
      'dateEnd'
    ],
      this.d.intervals
    );
    table.pointsCompletedTotaled = [];
    table.pointsCompleted.map((val, idx, arr) => {
      let result = val;
      if(idx > 0){
        result = val + table.pointsCompletedTotaled[idx-1];
      }
      table.pointsCompletedTotaled.push(result);
    });
    table.cardsCompletedTotaled = [];
    table.cardsCompleted.map((val, idx, arr) => {
      let result = val;
      if(idx > 0){
        result = val + table.cardsCompletedTotaled[idx-1];
      }
      table.cardsCompletedTotaled.push(result);
    });
    return table;
  }
  intervalNotes(){
    return this.getObjectPropInArrayByNameOrNull('notesInterval',
      this.d.intervals
    );
  }
  lastIntervalLabel(){
    const intervals = this.d.intervals;
    const index = intervals.length - 1;
    const label = intervals[index].label;
    return label;
  }
}
