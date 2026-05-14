import Charts from './Charts.js';

class Satisfaction extends Charts {
  constructor(el) {
    super(el);
    this.conf = {
      type: 'scatter',
      data: { datasets: [] },
      options: {
        scales: {
          x: {
            title: { display: true, text: 'Sprint Date' },
            ticks: {
              callback: (d) => this.tickFormatDates(d),
              precision: 0
            }
          },
          y: {
            title: { display: true, text: 'Score 1-10' },
            min: 0.5,
            max: 10.5,
            ticks: { precision: 0 }
          }
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: { label: (ctx) => this.trackFormatter(ctx) }
          }
        }
      }
    };
  }
  trackFormatter(ctx) {
    const index = ctx.dataIndex !== undefined ? ctx.dataIndex : ctx.index;
    const label = (this.labels && this.labels.length > 0) ? this.labels[index] : index;
    const date = (this.dates && this.dates.length > 0) ? this.dates[index] : index;
    const score = ctx.parsed ? ctx.parsed.y : ctx.y;
    const message = score === 0 ? 'No Voters!' : `Score: ${score}`;
    return `Date: ${date}<br>Interval: ${label}<br>${message}`;
  }
  setData(data) {
    this.data = data.map((val, idx) => ({
      label: val.label,
      data: val.scores.map((score, i) => ({ x: i, y: score })),
      borderColor: this.clr.getTheme()[idx],
      backgroundColor: 'transparent',
      pointRadius: 8,
      showLine: false
    }));
    this.conf.data.datasets = this.data;
  }
}

export default Satisfaction;
