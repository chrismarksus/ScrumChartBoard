(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
      chart = new Burndown('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Burndown chart', () => {
      it('should have line chart type', function () {
        expect(chart.conf.type).to.eql('line');
        expect(chart.conf.options.scales.y.ticks.precision).to.eql(0);
      });
      it('should format tooltip for estimated series', function () {
        expect(chart.tooltipLabel({ datasetIndex: 0, parsed: { y: 5 }, dataIndex: 0 }))
          .to.eql('Project Estimate: 5');
      });
      it('should format tooltip for completed series', function () {
        expect(chart.tooltipLabel({ datasetIndex: 1, parsed: { y: 10 }, dataIndex: 4 }))
          .to.eql('10 points completed in sprint 5');
      });
      it('should render without throwing', function () {
        chart.setData([[10, 20], [5, 15]]);
        expect(() => chart.render()).to.not.throw();
      });
      it('should have the correct data', function () {
        chart.setData([[20, 25, 25, 30], [5, 12, 18, 22]]);
        const d = chart.getData();
        expect(d[0].data).to.eql([5, 12, 18, 22]);
        expect(d[1].data).to.eql([20, 45, 70, 100]);
      });
      it('should accumulate completed points', function () {
        chart.setData([[10, 5, 15], [30, 30, 30]]);
        const d = chart.getData();
        expect(d[1].data).to.eql([10, 15, 30]);
      });
    });

})();
