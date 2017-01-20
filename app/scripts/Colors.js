class Colors{
  constructor(bgc = 'light', arr){
    let background;
    this.theme = arr || [
      '#77933c',
      '#376092',
      '#e46c0a',
      '#8064a2',
      '#4bacc6',
      '#c0504d',
      '#938953',
      '#17365d',
      '#545454',
      '#666666',
      '#b8cce4',
      '#eee8d5',
      '#002b36'
    ];
    this.names = {
      'done': this.theme[0],
      'todo': this.theme[1],
      'inprogress': this.theme[2],
      'background': this.theme[12],
      'gridlines': this.theme[8],
      'hover': this.theme[5],
      'satisfaction': this.theme[3],
      'legendlines':this.theme[9]
    };
    this.bgc = bgc;
    background = this.background();
    this.theme[12] = background;
  }
  background(){
    return (this.bgc === 'dark') ? this.theme[12] : '#ffffff';
  }
  getLabel(){
    return (this.bgc === 'dark') ? this.theme[11] : this.theme[8] ;
  }
  getTheme(){
    return this.theme;
  }
  satisfaction(num = 1){
    if(num === 1){
      return this.theme[3];
    } else if(num === 2){
      return [this.theme[7], this.theme[3]];
    }
  }
  done(){
    return this.theme[0];
  }
  todo(){
    return this.theme[1];
  }
  inprogress(){
    return this.theme[2];
  }
  hover(){
    return this.theme[5];
  }
  grid(){
    return this.theme[8];
  }
  legend(){
    return this.theme[9];
  }
  progress(rev = false){
    let result = [
      this.inprogress(),
      this.todo(),
      this.done(),
      this.hover()
    ];
    if(rev){
      result.reverse();
    }
    return result;
  }
  projection(){
    return [
      this.inprogress(),
      this.done(),
      this.theme[10]
    ];
  }
  statusToColor(value){
    let color;
    switch(value.toLowerCase()) {
      case 'done':
        color = this.theme[0];;
        break;
      case 'todo':
        color = this.theme[1];
        break;
      case 'inprogress':
        color = this.theme[2];
        break;
      case 'in-progress':
        color = this.theme[2];
        break;
      default:
        color = this.theme[4];
    }
    return color;
  }
}
