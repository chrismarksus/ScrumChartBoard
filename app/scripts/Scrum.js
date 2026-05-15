import Templates from './Templates.js';
import Satisfaction from './charts/Satisfaction.js';
import TwoBars from './charts/TwoBars.js';
import Line from './charts/Line.js';
import Lines from './charts/Lines.js';
import Burndown from './charts/Burndown.js';
import Status from './charts/Status.js';
import Timelines from './charts/Timelines.js';
import Types from './charts/Types.js';

class Scrum {
  constructor(id, model = {}, doc = document){
    this.el = document.getElementById(id);
    this.doc = doc;
    this.model = model;
    this.dboardWindowEvent;
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
    chart.setData(capcityData, Scrum.capacityKeys());
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
  issuesPerInterval(table, notes){
    const { data, labels } = Scrum.issuesPerIntervalInput(table);
    const chart = new Lines('issuesPerInterval', 'Issues');
    chart.setData(data, labels);
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
  burndown(table){
    const chart = new Burndown('burndown');
    chart.setData(Scrum.burndownInput(table));
    chart.setLabels(table.label);
    chart.setDates(table.dateEnd);
    chart.render();
    return chart;
  }
  timelines(timelines, table){
    return timelines.map((item, index) => {
      let el = `timeline_${index}`;
      document.getElementById(el).style.height = `${(item.timeline.length * 25) + 50}px`;
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
    const { data: pointsData, labels: pcLabels } = Scrum.pointsChartInput(table);
    const { data: cardData, labels: ccLabels } = Scrum.cardsChartInput(table);
    const { data: cardsBlockedData, labels: cbLabels } = Scrum.cardsBlockedInput(table);

    this.commitedCompleted(pointsData, table, pcLabels);
    this.pointsGoal(pointsData, table, notes, pcLabels);
    this.cardsCommitedCompleted(cardData, table, ccLabels);
    this.cardsGoal(cardData, table, notes, ccLabels);
    this.issuesPerInterval(table, notes);
    this.cardsBlocked(cardsBlockedData, table, notes, cbLabels);
    this.capacity(this.model.capacity(), table, notes);
    this.burndown(table);
    this.satisfaction(this.model.satisfaction(), table);

    if(this.model.d.project.timelines){
      this.timelines(this.model.d.project.timelines, table);
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
    this.el.innerHTML = Templates.main(data);
    this.doc.title = this.model.title();

    if(!this.dboardWindowEvent){
      this.dboardWindowEvent = func;
      window.addEventListener('resize', this.dboardWindowEvent);
    }
    this.draw(label);
  }
  destroy(){
    this.el.innerHTML = '';
    if(this.dboardWindowEvent){
      window.removeEventListener('resize', this.dboardWindowEvent);
      this.dboardWindowEvent = null;
    }
  }

  static pointsChartInput(table) {
    return {
      data: [
        { label: 'Commited', data: table.pointsCommited },
        { label: 'Completed', data: table.pointsCompleted }
      ],
      labels: { pointsCommited: 'Commited', pointsCompleted: 'Completed' }
    };
  }

  static cardsChartInput(table) {
    return {
      data: [
        { label: 'Commited', data: table.cardsCommited },
        { label: 'Completed', data: table.cardsCompleted }
      ],
      labels: { cardsCommited: 'Commited', cardsCompleted: 'Completed' }
    };
  }

  static cardsBlockedInput(table) {
    return {
      data: { cardsBlocked: table.cardsBlocked },
      labels: { cardsBlocked: 'Cards Blocked' }
    };
  }

  static burndownInput(table) {
    return [table.pointsCompleted, table.pointsEstimated];
  }

  static issuesPerIntervalInput(table) {
    return {
      data: { issuesPerInterval: table.issuesPerInterval },
      labels: { issuesPerInterval: 'Issues Per Interval' }
    };
  }

  static capacityKeys() {
    return {
      daysTimebox: 'Timeboxes',
      daysOutHolidays: 'Holidays',
      daysOutPlanned: 'Planned',
      daysOutUnplanned: 'Unplanned',
      daysWorked: 'Capacity'
    };
  }
}

export default Scrum;
