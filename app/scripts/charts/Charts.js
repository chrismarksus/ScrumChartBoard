class Charts {
  constructor(el) {
    const container = document.getElementById(el);
    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      container.appendChild(canvas);
    }
    this.el = canvas;
    this.clr = new Colors();
    this.labels = [];
    this.dates = [];
    this.notes = [];
    this.data = {};
    this.conf = {};
    this.chartRef = null;
  }
  getConf() {
    return this.conf;
  }
  setConf(conf) {
    this.conf = conf;
  }
  setNotes(notes) {
    this.notes = notes || [];
  }
  getNotes() {
    return this.notes;
  }
  getNoteMarkdown(index) {
    if (this.notes[index]) {
      return fetch(this.notes[index]).then(r => {
        if (r.ok) return r.text().then(text => this.processResponse(text));
      });
    }
    return null;
  }
  processResponse(text) {
    if (text) {
      this.setHash('#notesDescription');
      this.setMarkdownContent(this.processMarkdown(text));
    }
  }
  processMarkdown(data) {
    return new markdownit().render(data);
  }
  setMarkdownContent(html) {
    document.querySelector('#notesDescription .content').innerHTML = html;
  }
  setHash(str) {
    location.hash = str;
  }
  setData(data) {
    this.data = data;
  }
  getData() {
    return this.data;
  }
  setLabels(labels) {
    this.labels = labels;
  }
  setDates(dates) {
    this.dates = dates;
  }
  tickFormatLabels(d) {
    const i = parseInt(d, 10);
    return (this.labels && this.labels.length > 0) ? (this.labels[i] || '') : d;
  }
  tickFormatDates(d) {
    const i = parseInt(d, 10);
    return (this.dates && this.dates.length > 0) ? (this.dates[i] || '') : d;
  }
  render() {
    if (this.chartRef) { this.chartRef.destroy(); }
    const existing = Chart.getChart(this.el);
    if (existing) { existing.destroy(); }
    const options = this.conf.options = this.conf.options || {};
    if (options.maintainAspectRatio === undefined) {
      options.maintainAspectRatio = false;
    }
    if (this.notes.length > 0) {
      const options = this.conf.options = this.conf.options || {};
      const prev = options.onClick;
      options.onClick = (event, elements) => {
        if (elements.length > 0) this.getNoteMarkdown(elements[0].index);
        if (prev) prev(event, elements);
      };
    }
    this.chartRef = new Chart(this.el, this.conf);
  }
}
