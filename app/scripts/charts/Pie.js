class Pie extends Charts {
  constructor(el, mLabel = 'points') {
    super(el);
    this.mLabel = mLabel;
    this.conf = {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      },
      options: {
        plugins: {
          legend: { position: 'left' },
          tooltip: {
            callbacks: { label: (ctx) => this.formatTooltip(ctx) }
          }
        }
      }
    };
  }
  formatTooltip(ctx) {
    return `${ctx.label} ${Math.round(ctx.parsed)} ${this.mLabel}`;
  }
  setTypeValue(label) {
    this.mLabel = label;
  }
  getColors() {
    return this.clr.getTheme();
  }
  setData(data) {
    this.data = [];
    for (let name in data) {
      if (data[name] > 0) {
        this.data.push({ label: name, value: data[name] });
      }
    }
    const colors = this.getColors();
    this.conf.data.labels = this.data.map(d => d.label);
    this.conf.data.datasets[0].data = this.data.map(d => d.value);
    this.conf.data.datasets[0].backgroundColor = colors.slice(0, this.data.length);
  }
  render() {
    super.render();
  }
}
