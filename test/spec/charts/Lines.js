(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<p id="charts" style="height:100px;"></p>');
      chart = new Lines('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Lines chart', () => {
      it('should format each series as indexed [x, y] pairs', function () {
        chart.setData({
          'daysWorked': [10, 12, 8],
          'daysTimebox': [1, 0, 2]
        }, {
          'daysWorked': 'Capacity',
          'daysTimebox': 'Timeboxes'
        });
        let d = chart.getData();
        expect(d[0].label).to.eql('Capacity');
        expect(d[0].data).to.eql([[0, 10], [1, 12], [2, 8]]);
        expect(d[0].lines.show).to.eql(true);
        expect(d[0].points.show).to.eql(true);
      });
      it('should render without throwing', function () {
        chart.setData({ 'a': [1, 2] }, { 'a': 'Label' });
        expect(() => chart.render()).to.not.throw();
      });
      it('should create one series per key in the data object', function () {
        chart.setData({
          'a': [1, 2],
          'b': [3, 4]
        }, {
          'a': 'Series A',
          'b': 'Series B'
        });
        let d = chart.getData();
        expect(d.length).to.eql(2);
        expect(d[1].label).to.eql('Series B');
        expect(d[1].data).to.eql([[0, 3], [1, 4]]);
      });
    });

})();
