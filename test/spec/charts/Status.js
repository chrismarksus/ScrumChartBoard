(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
      chart = new Status('charts', 'Cat');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Status chart', () => {
      it('should filter out zero values from data', function () {
        chart.setData({ 'Done': 10, 'Todo': 0, 'In-Progress': 5 });
        const d = chart.getData();
        expect(d.length).to.eql(2);
        expect(d[0].label).to.eql('Done');
        expect(d[1].label).to.eql('In-Progress');
      });
      it('should render without throwing', function () {
        chart.setData({ 'Done': 10, 'In-Progress': 5 });
        expect(() => chart.render()).to.not.throw();
      });
      it('should use progress colors', function () {
        expect(chart.getColors()).to.eql(chart.clr.progress());
      });
      it('should have an mLabel of Cat', function () {
        expect(chart.mLabel).to.eql('Cat');
      });
    });

})();
