class TwoBars extends Charts{
  constructor(el, yLabel){
    super(el);
    this.labels = [];
    this.dates = [];
    this.yLabel = yLabel;
    this.conf = {
      colors: this.clr.progress(true).reverse().copyWithin(0,1),
      HtmlText: false,
      bars : {
        show : true,
        horizontal : false,
        barWidth: .9,
        lineWidth: 2
      },
      mouse : {
        track : true,
        relative : true,
        lineColor: this.clr.hover()
      },
      xaxis : {
        tickDecimals: 0,
        title: 'Sprint',
        titleAngle: 0,
      },
      yaxis : {
        min : 0,
        autoscaleMargin : 1,
        tickDecimals: 0,
        title: this.yLabel,
        titleAngle: 90
      },
      grid: {
        verticalLines: false,
        color: this.clr.grid(),
        tickColor: this.clr.grid()
      },
      legend: {
        show: true
      }
    };
  }
  tooltip(obj){
    return `${obj.series.label} ${Math.round(obj.y)} ${this.yLabel.toLowerCase()} for ${this.labels[obj.index]}`;
  }
  tickFormatLabels(d){
    let num = parseInt(d,10) + 1;
    let sprint = [0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,
      10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20];
    let tick = (num%2 === 0) ? num +1 : num;
    return (this.labels && this.labels.length > 0) ? this.labels[sprint[tick]] : sprint[tick];
  }
  setData(data){
    let newData = data.map((val, idx) => {
      let even = (idx % 2);
      return {
        'label'      : val.label,
        'data'       : val.data.map((val,idx,arr) => {
          let i = idx * 2;
          if(!even){
            i--;
          }
          return [i,val];
        })
      };
    });
    this.data = newData;
  }
  render(){
    this.conf.mouse.trackFormatter = this.tooltip.bind(this);
    this.conf.xaxis.tickFormatter  = this.tickFormatLabels.bind(this);
    super.render();
  }
}
