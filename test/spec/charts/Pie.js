(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<p id="charts" style="height:100px;"></p>');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Pie chart', () => {
      beforeEach(() => {
        chart = new Pie('charts', 'Cat');
      });
      it('should formatTickLabelPoint to return with label', function () {
        let result = chart.formatTickLabelPoint({
          'y': '220.123',
          'series': { 'label': 'Bob' }
        });
        expect(result).to.eql('Bob 220 Cat');
      });
      it('should formatMouselabelPoint to return with label', function () {
        let result = chart.formatMouselabelPoint({
          'y': '20',
          'series': { 'label': 'Bill' }
        });
        expect(result).to.eql('Bill 20 Cat');
      });
      it('should formatMouselabelPoint to return with label', function () {
        let result;
        chart.setTypeValue('Cow');
        result = chart.formatMouselabelPoint({
          'y': '30',
          'series': { 'label': 'Bee' }
        });
        expect(result).to.eql('Bee 30 Cow');
      });
    });

    describe('The Pie chart', () => {
      beforeEach(() => {
        chart = new Pie('charts');
      });
      it('should Configuration to have', function () {
        expect(chart.conf.HtmlText).to.eql(false);
        expect(chart.conf.grid).to.eql({
          verticalLines : false,
          horizontalLines : false,
          outlineWidth: 0
        });
        expect(chart.conf.xaxis).to.eql({
          showLabels : false
        });
        expect(chart.conf.yaxis).to.eql({
          showLabels : false
        });
        expect(chart.conf.pie).to.eql({
          show : true,
          explode : 6,
          startAngle: .73,
          lineWidth: 2
        });
      });
      it('should formatTickLabelPoint to return', function () {
        let result = chart.formatTickLabelPoint({
          'y': '10.123',
          'series': { 'label': 'Tim' }
        });
        expect(result).to.eql('Tim 10 points');
      });
      it('should set data', function () {
        chart.setData({
    			'In-Progress': 10,
          'Verifing': 0,
    			'Done': 20
    		});
        expect(chart.data).to.eql([
          {
            'data' : [[0, 10]],
            'label' : 'In-Progress'
          },{
            'data' : [[1, 20]],
            'label' : 'Done'
          }
        ]);
      });
    });

})();
