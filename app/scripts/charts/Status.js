import Pie from './Pie.js';

class Status extends Pie {
  constructor(el, mLabel = 'points') {
    super(el);
    this.mLabel = mLabel;
  }
  getColors() {
    return this.clr.progress();
  }
}

export default Status;
