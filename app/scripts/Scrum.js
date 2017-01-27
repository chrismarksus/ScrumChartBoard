class Scrum {
  constructor(id, model = {}, doc = document){
    const temp = App.templates;
    this.el = $(`#${id}`);
    this.doc = doc;
    this.model = model;
    this.dboardWindowEvent;

    Handlebars.registerPartial('dashboardHeader', temp.dashboardHeader);
    Handlebars.registerPartial('chartGroupPartial', temp.chartGroupPartial);
    Handlebars.registerPartial('deckLinkPartial', temp.deckLinkPartial);
    Handlebars.registerPartial('backlogPartial', temp.backlogPartial);
    Handlebars.registerPartial('popupPartial', temp.popupPartial);
    Handlebars.registerPartial('updatedPartial', temp.updatedPartial);
    Handlebars.registerPartial('velocity', temp.velocity);
    Handlebars.registerPartial('workdays', temp.workdays);
    Handlebars.registerPartial('capacity', temp.capacity);
    Handlebars.registerPartial('blockTitleWithCount', temp.blockTitleWithCount);
    Handlebars.registerPartial('estimatedCards', temp.estimatedCards);
  }
  satisfaction(data, table){
    const chart = new Satisfaction('satisfaction');
    chart.setData(data);
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.render();
    return chart;
  }
  commitedCompleted(pointsData, table, labels){
    const chart = new TwoBars('commitedvscompleted', 'Points');
    chart.setData(pointsData, labels);
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.render();
    return chart;
  }
  pointsGoal(pointsData, table, notes, labels){
    const chart = new Line('pointsgoals');
    chart.setData(pointsData, labels);
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.setNotes(notes.notesInterval);
    chart.render();
    return chart;
  }
  capacity(capcityData, table, notes){
    const chart = new Lines('daysWorked', 'Days');
    chart.setData(capcityData, {
      'daysTimebox': 'Timeboxes',
      'daysOutHolidays': 'Holidays',
      'daysOutPlanned': 'Planned',
      'daysOutUnplanned': 'Unplanned',
      'daysWorked': 'Capacity'
    });
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.setNotes(notes.notesInterval);
    chart.render();
    return chart;
  }
  cardsCommitedCompleted(data, table, labels){
    const chart = new TwoBars('cardscommitedvscompleted', 'Cards');
    chart.setData(data, labels);
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.render();
    return chart;
  }
  cardsGoal(data, table, notes, labels){
    const chart = new Line('cardsgoals');
    chart.setData(data, labels);
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.setNotes(notes.notesInterval);
    chart.render();
    return chart;
  }
  issuesPerInterval(data, table, notes){
    const chart = new Lines('issuesPerInterval', 'Issues');
    chart.setData({
      'issuesPerInterval': table.issuesPerInterval
    },{
      'issuesPerInterval' : 'Issues Per Sprint'
    });
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.setNotes(notes.notesInterval);
    chart.render();
    return chart;
  }
  cardsBlocked(data, table, notes, labels){
    const chart = new Lines('cardsBlocked', 'Blocked');
    chart.setData(data, labels);
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.setNotes(notes.notesInterval);
    chart.render();
    return chart;
  }
  status(data, typeValue){
    const chart = new Status('status');
    chart.setData(this.model.d.project.cardStatus);
    if(typeValue){
      chart.setTypeValue(typeValue);
    }
    chart.render();
    return chart;
  }
  cardTypes(data, typeValue){
    const chart = new Types('cardTypes');
    chart.setData(data);
    if(typeValue){
      chart.setTypeValue(typeValue);
    }
    chart.render();
    return chart;
  }
  burndown(data, table){
    const chart = new Burndown('burndown');
    chart.setData([
      table.pointsCompleted,
      table.pointsEstimated
    ]);
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.render();
    return chart;
  }
  timelines(timelines, table){
    return timelines.map((item, index) => {
      let el = `timeline_${index}`;
      $(`#${el}`).height((item.timeline.length * 25) + 50);
      let timelineChart = new Timelines(el);
      timelineChart.setLabels(table.label);
      timelineChart.setData(item.timeline);
      timelineChart.render();
      return timelineChart;
    });
  }
  draw(label){
    const notes = this.model.intervalNotes();
    const table = this.model.intervalData();
    const pcLabels = {
      'pointsCommited': 'Commited',
      'pointsCompleted': 'Completed'
    };
    const pointsData = [{
      label: 'Commited',
      data: table.pointsCommited
    },{
      label: 'Completed',
      data: table.pointsCompleted
    }];
    const ccLabels = {
      'cardsCommited': 'Commited',
      'cardsCompleted': 'Completed'
    };
    const cardData = [{
      label: 'Commited',
      data: table.cardsCommited
    },{
      label: 'Completed',
      data: table.cardsCompleted
    }];
    const cardsBlockedData = {
      'cardsBlocked': table.cardsBlocked
    };
    const cbLabels = {
      'cardsBlocked' : 'Cards Blocked'
    };
    const burndownData = [
      table.pointsCompleted,
      table.pointsEstimated
    ];

    this.commitedCompleted(
      pointsData, table, pcLabels
    );
    this.pointsGoal(
      pointsData, table, pcLabels
    );
    this.cardsCommitedCompleted(
      cardData, table, ccLabels
    );
    this.cardsGoal(
      cardData, table, notes, ccLabels
    );
    this.issuesPerInterval(
      cardData, table, notes, ccLabels
    );
    this.cardsBlocked(
      cardsBlockedData, table, notes, cbLabels
    );
    this.capacity(
      this.model.capacity(), table, notes
    );
    this.burndown(
      burndownData, table
    );
    this.satisfaction(
      this.model.satisfaction(), table
    );
    if(this.model.d.project.timelines){
      this.timelines(
        this.model.d.project.timelines, table
      );
    }
    if(this.model.d.project.cardStatus){
      this.status(
        this.model.d.project.cardStatus,
        this.model.d.project.cardStatusLabel || null
      );
    }
    if(this.model.d.project.cardTypes){
      this.cardTypes(
        this.model.d.project.cardTypes,
        this.model.d.project.cardTypeLabel || null
      );
    }

  }
  setup(){
    const label = this.model.lastIntervalLabel();
    const data = this.model.dashboard(label);
    let func = () => {
      this.draw(label);
    };
    this.el.html(App.templates.main(data));
    this.doc.title = this.model.title();

    if(!this.dboardWindowEvent){
      this.dboardWindowEvent = window.addEventListener('resize', func.bind(this));
    }
    this.draw(label);
  }
  destroy(){
    this.el.empty();
    if(this.dboardWindowEvent){
        this.dboardWindowEvent.removeEventListener('resize');
    }
  }
}
