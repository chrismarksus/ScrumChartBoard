class Timelines extends Charts{
  constructor(el){
    super(el);
    this.barLabels = [];
    this.conf = {
      timeline: {
        barWidth: .95,
        show:true,
      },
      markers: {
        show: true,
        position: 'rm',
        fontSize: 9,
        stacked: true,
        stackingType: 'a',
        color: this.clr.grid()
      },
      xaxis: {
        title: 'Sprint',
        noTicks: 10,
        tickDecimals: 0
      },
      yaxis: {
        showLabels : false
      },
      grid: {
        horizontalLines : false,
        color: this.clr.grid(),
        tickColor: this.clr.grid()
      }
    };
  }
  labelFormatter(d){
    // Stacked bars text
    return this.barLabels[d.y];
  }
  intervalFormatter(d){
    // Intervals on the bottom text
    let num = parseInt(d, 10);
    let label = this.labels[num] || 'N/A';
    return label || '';
  }
  processData(data){
    return data.map((item, index) => {
      let color = this.clr.statusToColor(item.status);
      return {
        color: color,
        data: [[
          (parseInt(item.start, 10) * 0.1),
          index,
          (parseInt(item.days, 10) * 0.1)
        ]]
      }
    });
  }
  processBarLabels(data){
    return data.map((item) => {
      return item.label;
    });
  }
  setData(data){
    this.barLabels = this.processBarLabels(data);
    this.data = this.processData(data);
  }
  render(){
    this.conf.markers.labelFormatter = this.labelFormatter.bind(this);
    this.conf.xaxis.tickFormatter = this.intervalFormatter.bind(this);
    super.render();
  }
}
