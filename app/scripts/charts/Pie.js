class Pie extends Charts{
  constructor(el, mLabel = 'points'){
    super(el);
    this.mLabel = mLabel;
    this.conf = {
      colors: this.clr.getTheme(),
      HtmlText : false,
      grid : {
        verticalLines : false,
        horizontalLines : false,
        outlineWidth: 0
      },
      xaxis : {
        showLabels : false
      },
      yaxis : {
        showLabels : false
      },
      pie : {
        show : true,
        explode : 6,
        startAngle: .73,
        lineWidth: 2
      },
      mouse : {
        track : true,
        lineColor: this.clr.hover()
      },
      legend : {
        position : 'nw',
        backgroundColor : null,
        labelBoxBorderColor: this.clr.legend()
      }
    };
  }
  formatTickLabelPoint(d){
    return `${d.series.label} ${Math.round(d.y)} ${this.mLabel}`;
  }
  formatMouselabelPoint(d){
    return `${d.series.label}  ${Math.round(d.y)} ${this.mLabel}`;
  };
  setData(data){
    let status = [];
    let count = 0;

    for(let name in data){
      if(data[name] > 0){
        status.push({
          'data' : [[count++, data[name]]],
          'label' : name
        });
      }
    }

    this.data = status;
  }
  render(){
    this.conf.mouse.trackFormatter  = this.formatMouselabelPoint.bind(this);
    super.render();
  }
}
