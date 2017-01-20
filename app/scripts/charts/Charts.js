class Charts{
  constructor(el){
    this.el = document.getElementById(el);
    this.clr = new Colors();
    this.labels = [];
    this.dates = [];
    this.notes = [];
    this.data = {};
    this.conf = {};
    this.listener;
  }
  getConf(){
    return this.conf;
  }
  setConf(conf){
    return this.conf = conf;
  }
  setNotes(notes){
    this.notes = notes;
    if(!this.listener){
      this.listener = Flotr.EventAdapter.observe(
        this.el,
        'flotr:click',
        this.getNoteMarkdown.bind(this)
      );
    }
  }
  getNotes(notes){
    return this.notes;
  }
  getNoteIndex(position){
    return this.chartRef.hit.hit(position).index;
  }
  getNoteMarkdown(position){
    let index = this.getNoteIndex(position);
    if(this.notes[index]){
      return $.getJSON(
        this.notes[index]
      ).complete(
        this.processResponse.bind(this)
      );
    }
    return null;
  }
  processResponse(data){
    if(data.status === 200 && data.responseText){
      let md = this.processMarkdown(data.responseText);
      this.setHash('#notesDescription');
      this.setMarkdownContent(md);
    }
  }
  processMarkdown(data){
    let parser = new markdownit();
    let md = parser.render(data);
    return md;
  }
  setMarkdownContent(html){
    $('#notesDescription .content').html(html);
  }
  setHash(str){
    location.hash = str;
  }
  setData(data){
    this.data = data;
  }
  getData(data){
    return this.data;
  }
  setLabels(labels){
    this.labels = labels;
  }
  setDates(dates){
    this.dates = dates;
  }
  tickFormatLabels(d){
    let label = (this.labels && this.labels.length > 0) ? this.labels[d] : d
    return label || '';
  }
  tickFormatDates(d){
    let dates = (this.dates && this.dates.length > 0) ? this.dates[d] : d;
    return dates || '';
  }
  render(){
    this.chartRef = Flotr.draw(this.el, this.data, this.conf);
  }
}
