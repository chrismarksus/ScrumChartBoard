(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
      chart = new Line('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Line chart', () => {
      it('should have line chart type with Percentage y-axis', function () {
        expect(chart.conf.type).to.eql('line');
        expect(chart.conf.options.scales.y.title.text).to.eql('Percentage');
      });
      it('should handle zero values', function () {
        chart.setData([
          { label: 'Commited', data: [0] },
          { label: 'Completed', data: [0] }
        ]);
        expect(chart.getData()[0].data).to.eql([0]);
      });
      it('should render without throwing', function () {
        chart.setData([
          { label: 'Commited', data: [5, 7] },
          { label: 'Completed', data: [3, 9] }
        ]);
        expect(() => chart.render()).to.not.throw();
      });
      it('should format data as percentage values', function () {
        chart.setData([{
            label: 'Completed',
            data: [2, 3, 4, 5]
          },{
            label: 'Commited',
            data: [5, 2, 7, 5]
        }]);
        const d = chart.getData()[0];
        expect(d.data).to.eql([250, 67, 175, 100]);
      });
    });

})();
