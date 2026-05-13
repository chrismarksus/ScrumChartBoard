(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
      chart = new Satisfaction('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Satisfaction chart', () => {
      it('should format the tick as the date at that index', function () {
        chart.setDates(['2/22/2000', '3/1/2001']);
        expect(chart.tickFormatDates(0)).to.eql('2/22/2000');
        expect(chart.tickFormatDates(1)).to.eql('3/1/2001');
      });
      it('should return the raw index when no dates are set', function () {
        expect(chart.tickFormatDates(5)).to.eql(5);
      });
      it('should render without throwing', function () {
        chart.setData([{ label: 'team', scores: [5, 7] }]);
        expect(() => chart.render()).to.not.throw();
      });
      it('should format tooltip with score', function () {
        chart.setLabels(['Sprint 1']);
        chart.setDates(['2/22/2000']);
        let result = chart.trackFormatter({ dataIndex: 0, parsed: { y: 2.5 } });
        expect(result).to.eql('Date: 2/22/2000<br>Interval: Sprint 1<br>Score: 2.5');
      });
      it('should format tooltip with no voters', function () {
        chart.setLabels(['Sprint 1']);
        chart.setDates(['2/22/2000']);
        let result = chart.trackFormatter({ dataIndex: 0, parsed: { y: 0 } });
        expect(result).to.eql('Date: 2/22/2000<br>Interval: Sprint 1<br>No Voters!');
      });
      it('should format data as scatter points', function () {
        const data = [
          { label: 'team', scores: [5, 8] },
          { label: 'shareholder', scores: [3, 7] }
        ];
        chart.setData(data);
        const d = chart.getData();
        expect(d[0].label).to.eql('team');
        expect(d[0].data).to.eql([{ x: 0, y: 5 }, { x: 1, y: 8 }]);
        expect(d[1].label).to.eql('shareholder');
        expect(d[1].data).to.eql([{ x: 0, y: 3 }, { x: 1, y: 7 }]);
      });
    });

})();
