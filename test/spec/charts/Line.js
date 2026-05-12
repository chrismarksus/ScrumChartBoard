(function () {
  'use strict';

  let chart, helper;
    beforeEach(() => {
      $('#sandbox').append('<p id="charts" style="height:100px;"></p>');
      chart = new Line('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Line chart', () => {
      it('should have the correct default configuration', function () {
        expect(chart.conf.yaxis.title).to.eql('Percentage');
        expect(chart.conf.grid.verticalLines).to.eql(false);
      });
      it('should handle zero values', function () {
        chart.setData([
          { label: 'Commited', data: [0] },
          { label: 'Completed', data: [0] }
        ]);
        expect(chart.getData()[0].data).to.eql([[0, 0]]);
      });
      it('should render without throwing', function () {
        chart.setData([
          { label: 'Commited', data: [5, 7] },
          { label: 'Completed', data: [3, 9] }
        ]);
        expect(() => chart.render()).to.not.throw();
      });
      it('should format data', function () {
        chart.setData([{
            label: 'Completed',
            data: [2,3,4,5]
          },{
            label: 'Commited',
            data: [5,2,7,5]
        }]);
        let d = chart.getData()[0];
        expect(d.lines.show).to.eql(true);
        expect(d.points.show).to.eql(true);
        expect(d.data).to.eql([
          [0,250],
          [1,67],
          [2,175],
          [3,100]
        ]);
      });
    });

})();
