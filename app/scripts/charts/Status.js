class Status extends Pie {
  constructor(el, mLabel = 'points') {
    super(el);
    this.mLabel = mLabel;
  }
  getColors() {
    return this.clr.progress();
  }
}
