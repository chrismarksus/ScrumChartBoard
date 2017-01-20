class Status extends Pie{
  constructor(el, mLabel = 'points'){
    super(el);
    this.conf.colors = this.clr.progress();
    this.mLabel = mLabel;
  }
  setData(data){
    super.setData(data);
  }
  render(){
    super.render();
  }
}
