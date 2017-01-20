class Lines extends Charts{
  constructor(el, yLabel){
    super(el);
    this.labels = [];
    this.dates = [];
    this.yLabel = yLabel;
    this.conf = {
      colors: this.clr.getTheme(),
      HtmlText: false,
      yaxis: {
        tickDecimals: 0,
        margin: true,
        autoscale: true,
        autoscaleMargin: 0.5,
        title: this.yLabel,
        min: -1.5
      },
      xaxis: {
        tickDecimals: 0,
        margin: true,
        autoscale: true,
        autoscaleMargin: 0.5,
        min: -0.5
      },
      grid: {
        minorHorizontalLines: true,
        verticalLines : false,
        horizontalLines : true,
        outlineWidth: 0,
        color: this.clr.grid(),
        tickColor: this.clr.grid()
      },
      mouse : {
        lineColor: this.clr.hover(),
        sensibility: 30,
        relative: true,
        track : false
      }
    };
  }
  setData(data, names){
    let d1 = [];
    for(let d in data){
      let label = names[d];
      d1.push({
        'data': data[d].map((val, idx) => {
          return [idx, val];
        }),
        'label': label,
        'lines': {
          'show': true
        },
        'points': {
          'show': true
        }
      });
    }
    this.data = d1;
  }
  render(){
    this.conf.xaxis.tickFormatter  = this.tickFormatLabels.bind(this);
    super.render();
  }
}
