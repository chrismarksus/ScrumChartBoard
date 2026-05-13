(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Pie chart', () => {
      beforeEach(() => {
        chart = new Pie('charts', 'Cat');
      });
      it('should formatTooltip with label and value', function () {
        let result = chart.formatTooltip({ label: 'Bob', parsed: 220.123 });
        expect(result).to.eql('Bob 220 Cat');
      });
      it('should formatTooltip after setTypeValue', function () {
        chart.setTypeValue('Cow');
        let result = chart.formatTooltip({ label: 'Bee', parsed: 30 });
        expect(result).to.eql('Bee 30 Cow');
      });
    });

    describe('The Pie chart', () => {
      beforeEach(() => {
        chart = new Pie('charts');
      });
      it('should have pie chart type', function () {
        expect(chart.conf.type).to.eql('pie');
      });
      it('should formatTooltip with default label', function () {
        let result = chart.formatTooltip({ label: 'Tim', parsed: 10.123 });
        expect(result).to.eql('Tim 10 points');
      });
      it('should set data filtering out zero values', function () {
        chart.setData({
          'In-Progress': 10,
          'Verifying': 0,
          'Done': 20
        });
        expect(chart.data).to.eql([
          { label: 'In-Progress', value: 10 },
          { label: 'Done', value: 20 }
        ]);
        expect(chart.conf.data.labels).to.eql(['In-Progress', 'Done']);
        expect(chart.conf.data.datasets[0].data).to.eql([10, 20]);
      });
    });

})();
