(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<p id="charts" style="height:100px;"></p>');
      chart = new Burndown('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Burndown chart', () => {
      it('should makeDataLine false', function () {
        let results = chart.makeDataLine([0,1], false);

        expect(results).to.eql({
          'data': [0,1],
          'points' : {
            'show' : false,
            'lineWidth': 1
          },
          'lines' : {
            'show' : true,
            'lineWidth': 1
          },
          'mouse': {
            'track': false
          }
        });
      });
      it('should makeDataLine true', function () {
        let results = chart.makeDataLine([0,1], true);

        expect(results).to.eql({
          'data': [0,1],
          'points' : {
            'show' : true,
            'lineWidth': 1
          },
          'lines' : {
            'show' : true,
            'lineWidth': 1
          },
          'mouse': {
            'track': false
          }
        });
      });
      it('should makeDataLine true with formater', function () {
        let formatter = () => {};
        let results = chart.makeDataLine([0,1], true, formatter);

        expect(results).to.eql({
          'data': [0,1],
          'points' : {
            'show' : true,
            'lineWidth': 1
          },
          'lines' : {
            'show' : true,
            'lineWidth': 1
          },
          'mouse': {
            'trackFormatter': formatter
          }
        });
      });
      it('should estimatedMouseOver', function () {
        chart.setData([[20,25,25,30],[5,12,18,22]]);
        let d = chart.getData();
        let f1 = d[0].mouse.trackFormatter({ 'y': '5'});
        expect(f1).to.eql('Project Estimate: 5');
      });
      it('should completedMouseOver', function () {
        chart.setData([[20,25,25,30],[5,12,18,22]]);
        let d = chart.getData();
        let f1 = d[1].mouse.trackFormatter({ 'x': '5', 'y': 10});
        expect(f1).to.eql('10 points completed in sprint 5');
      });
      it('should processData', function () {
        let result = chart.processData([[0,5],[1,12],[2,18],[3,22]], null ,[[0,20],[1,45],[2,70],[3,100]]);
        let d = chart.getData();
        expect(result[1].data).to.eql([[0,20],[1,45],[2,70],[3,100]]);
      });
      it('should have the correct data', function () {
        chart.setData([[20,25,25,30],[5,12,18,22]]);
        let d = chart.getData();
        expect(d[0].points).to.eql({
          'show' : true,
          'lineWidth': 1
        });
        expect(d[1].points).to.eql({
          'show' : true,
          'lineWidth': 1
        });
        expect(d[0].lines).to.eql({
          'show' : true,
          'lineWidth': 1
        });
        expect(d[1].lines).to.eql({
          'show' : true,
          'lineWidth': 1
        });
        expect(d[0].data).to.eql([[0,5],[1,12],[2,18],[3,22]]);
        expect(d[1].data).to.eql([[0,20],[1,45],[2,70],[3,100]]);

      });
    });

})();
