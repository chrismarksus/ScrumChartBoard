class Burndown extends Charts {
  constructor(el) {
    super(el);
    this.conf = {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: {
        scales: {
          x: { ticks: { callback: (d) => this.tickFormatLabels(d) } },
          y: { ticks: { precision: 0 } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => this.tooltipLabel(ctx) }
          }
        }
      }
    };
  }
  tooltipLabel(ctx) {
    if (ctx.datasetIndex === 0) {
      return `Project Estimate: ${Math.round(ctx.parsed.y)}`;
    }
    return `${Math.round(ctx.parsed.y)} points completed in sprint ${ctx.dataIndex + 1}`;
  }
  setData(data) {
    let count = 0;
    const completed = [];
    const estimated = [];
    for (let i = 0; i < data[0].length; i++) {
      count += data[0][i];
      completed.push(count);
      estimated.push(data[1][i]);
    }
    this.data = [
      {
        label: 'Estimated',
        data: estimated,
        borderColor: this.clr.projection()[0],
        backgroundColor: 'transparent',
        pointRadius: 3,
        tension: 0
      },
      {
        label: 'Completed',
        data: completed,
        borderColor: this.clr.projection()[1],
        backgroundColor: 'transparent',
        pointRadius: 3,
        tension: 0
      }
    ];
    this.conf.data.datasets = this.data;
  }
  render() {
    this.conf.data.labels = this.labels;
    super.render();
  }
}
