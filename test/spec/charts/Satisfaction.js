(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<p id="charts" style="height:100px;"></p>');
      chart = new Satisfaction('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Satisfaction chart', () => {
      it('should format the tick as the date at that index', function () {
        chart.setDates(['2/22/2000', '3/1/2001']);
        expect(chart.tickFormatter(0)).to.eql('2/22/2000');
        expect(chart.tickFormatter(1)).to.eql('3/1/2001');
      });
      it('should return the raw index when no dates are set', function () {
        expect(chart.tickFormatter(5)).to.eql(5);
      });
      it('should render without throwing', function () {
        chart.setData([{ label: 'team', scores: [5, 7] }]);
        expect(() => chart.render()).to.not.throw();
      });
      it('should format data', function () {
        chart.setLabels(['Spint 1']);
        chart.setDates(['2/22/2000']);
        let result = chart.trackFormatter({
          'index': 0,
          'y': 2.5
        });
        expect(result).to.eql('Date: 2/22/2000<br>Interval: Spint 1<br>Score: 2.5');
      });
      it('should format data', function () {
        chart.setLabels(['Spint 1']);
        chart.setDates(['2/22/2000']);
        let result = chart.trackFormatter({
          'index': 0,
          'y': 0
        });
        expect(result).to.eql('Date: 2/22/2000<br>Interval: Spint 1<br>No Voters!');
      });
      it('should format data', function () {
        let result = [{
          'label'      : 'team',
          'data'       : [[0,[0,1]],[1,[1,2]]],
          'lines'      : {
            'show'     : false
          },
          'points'     : {
            'show'     : true,
            'radius'   : 4,
            'fill'     : false,
            'lineWidth': 8,
            'fillColor': '#ffffff'
          }
        },{
          'label'      : 'shareholder',
          'data'       : [[0,[0,3]],[1,[1,4]]],
          'lines'      : {
            'show'     : false
          },
          'points'     : {
            'show'     : true,
            'radius'   : 4,
            'fill'     : false,
            'lineWidth': 8,
            'fillColor': '#ffffff'
          }
        }];
        let data = [{
          'label': 'team',
          'scores': [[0,1],[1,2]]
        },{
          'label': 'shareholder',
          'scores': [[0,3],[1,4]]
        }];
        chart.setData(data);
        expect(chart.getData()).to.eql(result);
      });
    });

})();
