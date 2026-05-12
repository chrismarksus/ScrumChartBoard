(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<p id="charts" style="height:100px;"></p>');
      chart = new TwoBars('charts', 'Points');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The TwoBars chart', () => {
      it('should format data', function () {
        let data = [{
            label: 'Completed',
            data: [
              [-1,2],
              [1,3],
              [3,4],
              [5,5]
            ]
          },{
            label: 'Commited',
            data: [
              [0,5],
              [2,2],
              [4,7],
              [6,5]
            ]
        }];
        chart.setData(data);
        expect(chart.getData()[0].label).to.eql('Completed');
        expect(chart.getData()[1].label).to.eql('Commited');
        expect(chart.getData()[0].data).to.eql([
          [-1,[-1,2]],
          [1,[1,3]],
          [3,[3,4]],
          [5,[5,5]]
        ]);
        expect(chart.getData()[1].data).to.eql([
          [0,[0,5]],
          [2,[2,2]],
          [4,[4,7]],
          [6,[6,5]]
        ]);
      });
      it('should map adjacent x values to the same sprint label', function () {
        chart.setLabels(['Sprint 1', 'Sprint 2', 'Sprint 3']);
        expect(chart.tickFormatLabels(-1)).to.eql('Sprint 1');
        expect(chart.tickFormatLabels(0)).to.eql('Sprint 1');
        expect(chart.tickFormatLabels(1)).to.eql('Sprint 2');
        expect(chart.tickFormatLabels(2)).to.eql('Sprint 2');
        expect(chart.tickFormatLabels(3)).to.eql('Sprint 3');
      });
      it('should return raw sprint index when no labels are set', function () {
        expect(chart.tickFormatLabels(0)).to.eql(0);
        expect(chart.tickFormatLabels(1)).to.eql(1);
      });
      it('should render without throwing', function () {
        chart.setData([
          { label: 'Commited', data: [[0, 5]] },
          { label: 'Completed', data: [[1, 3]] }
        ]);
        expect(() => chart.render()).to.not.throw();
      });
      it('should have a tooltip', function () {
        chart.setLabels(['Sprint 1']);
        expect(chart.tooltip({
          index: 0,
          series: {
            label: 'bob'
          },
          y: 10
        })).to.eql('bob 10 points for Sprint 1');
      });
    });

})();
