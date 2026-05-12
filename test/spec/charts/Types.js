(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<p id="charts" style="height:100px;"></p>');
      chart = new Types('charts', 'Cat');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Types chart', () => {
      it('should filter out zero values from data', function () {
        chart.setData({ 'Stories': 5, 'Bugs': 0, 'Spikes': 3 });
        let d = chart.getData();
        expect(d.length).to.eql(2);
        expect(d[0].label).to.eql('Stories');
        expect(d[1].label).to.eql('Spikes');
      });
      it('should render without throwing', function () {
        chart.setData({ 'Stories': 5 });
        expect(() => chart.render()).to.not.throw();
      });
      it('should have an mLabel of Cat', function () {
        let result = chart.mLabel;
        expect(result).to.eql('Cat');
      });
    });

})();
