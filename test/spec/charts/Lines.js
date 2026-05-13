(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
      chart = new Lines('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Lines chart', () => {
      it('should format each series with flat data arrays', function () {
        chart.setData({
          'daysWorked': [10, 12, 8],
          'daysTimebox': [1, 0, 2]
        }, {
          'daysWorked': 'Capacity',
          'daysTimebox': 'Timeboxes'
        });
        const d = chart.getData();
        expect(d[0].label).to.eql('Capacity');
        expect(d[0].data).to.eql([10, 12, 8]);
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
        const d = chart.getData();
        expect(d.length).to.eql(2);
        expect(d[1].label).to.eql('Series B');
        expect(d[1].data).to.eql([3, 4]);
      });
    });

})();
