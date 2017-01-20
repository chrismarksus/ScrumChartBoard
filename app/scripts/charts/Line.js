class Line extends Charts{
  constructor(el, yLabel){
    super(el);
    this.labels = [];
    this.dates = [];
    this.yLabel = yLabel;
    this.conf = {
      colors: [this.clr.todo()],
      HtmlText: false,
      yaxis: {
        tickDecimals: 0,
        margin: true,
        autoscale: true,
        title: 'Percentage',
        autoscaleMargin: 1
      },
      xaxis: {
        tickDecimals: 0,
        margin: true,
        autoscale: true,
        autoscaleMargin: 1,
        min: -0.1
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
  setData(data){
    let d1 = [];

    for(let i = 0; i < data[0].data.length; i++){
      d1.push([i, Math.round((data[1].data[i] / data[0].data[i]) * 100)]);
    }

    this.data = [{
      data: d1,
      lines: {
        show: true
      },
      points: {
        show: true
      }
    }];
  }
  render(){
    this.conf.xaxis.tickFormatter  = this.tickFormatLabels.bind(this);
    super.render();
  }
}
