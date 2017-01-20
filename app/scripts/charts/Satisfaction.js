class Satisfaction extends Charts{
  constructor(el){
    super(el);
    this.conf = {
      colors: this.clr.getTheme(),
      HtmlText: false,
      yaxis: {
        title           : 'Score 1-10',
        tickDecimals    : 0,
        max             : 10.5,
        min             : .5
      },
      xaxis: {
        title           : 'Sprint Date',
        tickDecimals    : 0,
        min             : -0.1
      },
      grid: {
        tickDecimals    : 0,
        verticalLines   : false,
        horizontalLines : true,
        outlineWidth    : 0,
        color           : this.clr.grid(),
        tickColor       : this.clr.grid()
      },
      mouse : {
        lineColor       : this.clr.hover(),
        sensibility     : 30,
        relative        : true,
        track           : true
      },
      legend: {
        show               : true,
        position           : 'ne',
        labelBoxBorderColor: this.clr.legend(),
        backgroundColor    : this.clr.background(),
        backgroundOpacity  : 0.75
      }
    };
  }
  tickFormatter(d){
    return (this.dates && this.dates.length > 0) ? this.dates[d] : d;
  }
  trackFormatter(d){
    let message = '';
    let label = (this.labels && this.labels.length > 0) ? this.labels[d.index] : d ;
    let date = (this.dates && this.dates.length > 0) ? this.dates[d.index] : d ;
    if(d.y === 0){
      message += 'No Voters!';
    } else {
      message += `Score: ${d.y}`;
    }
    return `Date: ${date}<br>Interval: ${label}<br>${message}`;
  }
  setData(data){
    let newData = data.map((val) => {
      return {
        'label'      : val.label,
        'data'       : val.scores.map((val,idx,arr) => {
          return [idx,val];
        }),
        'lines'      : {
          'show'     : false
        },
        'points'     : {
          'show'     : true,
          'radius'   : 4,
          'fill'     : false,
          'lineWidth': 8,
          'fillColor': this.clr.background()
        }
      };
    });
    this.data = newData;
  }
  render(){
    this.conf.mouse.trackFormatter = this.trackFormatter.bind(this);
    this.conf.xaxis.tickFormatter  = this.tickFormatter.bind(this);
    super.render();
  }
}
