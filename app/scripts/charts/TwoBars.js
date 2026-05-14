import Charts from './Charts.js';

class TwoBars extends Charts {
  constructor(el, yLabel) {
    super(el);
    this.yLabel = yLabel;
    this.conf = {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: {
        scales: {
          x: { ticks: { callback: (d) => this.tickFormatLabels(d) } },
          y: {
            min: 0,
            title: { display: !!yLabel, text: yLabel },
            ticks: { precision: 0 }
          }
        },
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: { label: (ctx) => this.tooltip(ctx) }
          }
        }
      }
    };
  }
  tooltip(ctx) {
    const label = this.labels[ctx.dataIndex] || ctx.dataIndex;
    return `${ctx.dataset.label} ${Math.round(ctx.parsed.y)} ${this.yLabel.toLowerCase()} for ${label}`;
  }
  setData(data) {
    const colors = this.clr.progress(true).reverse().copyWithin(0, 1);
    this.data = data.map((val, idx) => ({
      label: val.label,
      data: val.data,
      backgroundColor: colors[idx]
    }));
    this.conf.data.datasets = this.data;
  }
  render() {
    this.conf.data.labels = this.labels;
    super.render();
  }
}

export default TwoBars;
