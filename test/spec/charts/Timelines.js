(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<p id="charts" style="height:100px;"></p>');
      chart = new Timelines('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Timelines chart', () => {
      it('should provide the correct config', function () {
        expect(chart.conf.timeline).to.eql({
          barWidth: .95,
          show:true,
        });
        expect(chart.conf.markers).to.eql({
          show: true,
          position: 'rm',
          fontSize: 9,
          stacked: true,
          stackingType: 'a',
          color: '#545454'
        });
        expect(chart.conf.xaxis).to.eql({
          title: 'Sprint',
          noTicks: 10,
          tickDecimals: 0
        });
        expect(chart.conf.yaxis).to.eql({
          showLabels : false
        });
        expect(chart.conf.grid).to.eql({
          horizontalLines : false,
          color: '#545454',
          tickColor: '#545454'
        });
      });
      it('should provide text the labelFormatter method', function () {
        chart.setData([{
            'label': 'Theme group 1',
            'status': 'inprogress',
            'days': 30,
            'start': 0
          },{
            'label': 'Theme group 2',
            'status': 'todo',
            'days': 20,
            'start': 30
          }]);
        let d = chart.labelFormatter({
          'y': 1
        });
        expect(d).to.eql('Theme group 2');
      });
      it('should provide text the intervalFormatter method', function () {
        chart.setLabels(['Sprint 0', 'Sprint 1'])
        let d = chart.intervalFormatter(1);
        expect(d).to.eql('Sprint 1');
      });
      it('should have the correct data', function () {
        chart.setData([{
            'label': 'Theme group 1',
            'status': 'inprogress',
            'days': 30,
            'start': 0
          },{
            'label': 'Theme group 2',
            'status': 'todo',
            'days': 20,
            'start': 30
          }]);
        let d = chart.getData();
        expect(d).to.eql([{
          'color': '#e46c0a',
          'data': [[0,0,3]]
        },{
          'color': '#376092',
          'data': [[3,1,2]]
        }]);
      });
    });

})();
