(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
      chart = new TwoBars('charts', 'Points');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The TwoBars chart', () => {
      it('should format data as flat arrays per series', function () {
        const data = [
          { label: 'Commited',  data: [5, 10, 15] },
          { label: 'Completed', data: [3,  8, 12] }
        ];
        chart.setData(data);
        expect(chart.getData()[0].label).to.eql('Commited');
        expect(chart.getData()[0].data).to.eql([5, 10, 15]);
        expect(chart.getData()[1].label).to.eql('Completed');
        expect(chart.getData()[1].data).to.eql([3, 8, 12]);
      });
      it('should format label by sprint index', function () {
        chart.setLabels(['Sprint 1', 'Sprint 2', 'Sprint 3']);
        expect(chart.tickFormatLabels(0)).to.eql('Sprint 1');
        expect(chart.tickFormatLabels(1)).to.eql('Sprint 2');
        expect(chart.tickFormatLabels(2)).to.eql('Sprint 3');
      });
      it('should return raw value when no labels are set', function () {
        expect(chart.tickFormatLabels(0)).to.eql(0);
        expect(chart.tickFormatLabels(1)).to.eql(1);
      });
      it('should render without throwing', function () {
        chart.setData([
          { label: 'Commited',  data: [5] },
          { label: 'Completed', data: [3] }
        ]);
        expect(() => chart.render()).to.not.throw();
      });
      it('should have a tooltip', function () {
        chart.setLabels(['Sprint 1']);
        expect(chart.tooltip({
          dataIndex: 0,
          dataset: { label: 'bob' },
          parsed: { y: 10 }
        })).to.eql('bob 10 points for Sprint 1');
      });
    });

})();
