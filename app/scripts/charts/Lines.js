import Charts from './Charts.js';

class Lines extends Charts {
  constructor(el, yLabel) {
    super(el);
    this.yLabel = yLabel;
    this.conf = {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: {
        scales: {
          x: { ticks: { callback: (d) => this.tickFormatLabels(d) } },
          y: {
            title: { display: !!yLabel, text: yLabel },
            ticks: { precision: 0 }
          }
        }
      }
    };
  }
  setData(data, names) {
    this.data = Object.keys(data).map((key, idx) => ({
      label: names[key],
      data: data[key],
      borderColor: this.clr.getTheme()[idx],
      backgroundColor: 'transparent',
      pointRadius: 4,
      tension: 0
    }));
    this.conf.data.datasets = this.data;
  }
  render() {
    this.conf.data.labels = this.labels;
    super.render();
  }
}

export default Lines;
