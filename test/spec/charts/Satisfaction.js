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
