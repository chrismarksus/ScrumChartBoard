class Burndown extends Charts{
  constructor(el, yLabel){
    super(el);
    this.conf = {
      colors: this.clr.projection(),
      HtmlText: false,
      xaxis: {
        minorTickFreq: 2,
        title: 'Sprints',
        showLabels: true,
        showMinorLabels: true,
        autoscale: true,
        autoscaleMargin: 1,
        showLabels: true,
        tickDecimals: 0
      },
      yaxis: {
        autoscale: true,
        autoscaleMargin: 1,
        tickDecimals: 0
      },
      grid: {
        labelMargin: 5,
        minorVerticalLines: true,
        color: this.clr.grid(),
        tickColor: this.clr.grid()
      },
      mouse : {
        lineColor: this.clr.hover(),
        sensibility: 30,
        relative: true,
        track : true
      }
    };
  }
  makeDataLine(data, point, formatter){
    let conf = {
      'data': data,
      'points' : {
        'show' : (point) ? true : false,
        'lineWidth': 1
      },
      'lines' : {
        'show' : true,
        'lineWidth': 1
      },
      'mouse': {}
    };

    if(formatter){
      conf.mouse.trackFormatter = formatter;
    } else {
      conf.mouse.track = false;
    }

    return conf;
  }
  estimatedMouseOver(d){
    return `Project Estimate: ${parseInt(d.y)}`;
  }
  completedMouseOver(d){
    return `${parseInt(d.y)} points completed in sprint ${parseInt(d.x)}`;
  }
  processData(completed, estimated, predicted){
    let arr = [];
    if(estimated){
      arr.push(this.makeDataLine(estimated, true, this.estimatedMouseOver));
    }
    arr.push(this.makeDataLine(completed, true, this.completedMouseOver));
    if(predicted){
      arr.push(this.makeDataLine(predicted, false));
    }
    return arr;
  }
  setData(data){
    let count = 0;
    let completed = [];
    let estimated = [];
    for(let i = 0; i < data[0].length; i++){
      count += data[0][i];
      completed.push([i, count]);
      estimated.push([i, data[1][i]]);
    }
    this.data = this.processData(completed, estimated);
  }
  render(){
    this.conf.xaxis.tickFormatter  = this.tickFormatLabels.bind(this);
    super.render();
  }
}
