class Line extends Charts {
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
            title: { display: true, text: 'Percentage' },
            ticks: { precision: 0 }
          }
        },
        plugins: { legend: { display: false } }
      }
    };
  }
  setData(data) {
    const helper = new Helper();
    const d1 = [];
    for (let i = 0; i < data[0].data.length; i++) {
      d1.push(helper.calcPercentage(data[1].data[i], data[0].data[i]));
    }
    this.data = [{
      data: d1,
      borderColor: this.clr.todo(),
      backgroundColor: 'transparent',
      pointRadius: 4,
      tension: 0
    }];
    this.conf.data.datasets = this.data;
  }
  render() {
    this.conf.data.labels = this.labels;
    super.render();
  }
}
