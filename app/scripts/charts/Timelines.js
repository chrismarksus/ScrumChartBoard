import Charts from './Charts.js';

class Timelines extends Charts {
  constructor(el) {
    super(el);
    this.conf = {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            title: { display: true, text: 'Sprint' },
            ticks: { callback: (d) => this.intervalFormatter(d) }
          }
        },
        plugins: { legend: { display: false } }
      }
    };
  }
  intervalFormatter(d) {
    return this.labels[parseInt(d, 10)] || '';
  }
  processBarLabels(data) {
    return data.map(item => item.label);
  }
  setData(data) {
    this.data = data.map(item => ({
      label: item.label,
      start: parseInt(item.start, 10) * 0.1,
      end: (parseInt(item.start, 10) + parseInt(item.days, 10)) * 0.1,
      color: this.clr.statusToColor(item.status)
    }));
    this.conf.data.labels = this.data.map(d => d.label);
    this.conf.data.datasets = [{
      data: this.data.map(d => [d.start, d.end]),
      backgroundColor: this.data.map(d => d.color),
      borderWidth: 0
    }];
  }
}

export default Timelines;
