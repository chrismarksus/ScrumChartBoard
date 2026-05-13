(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
      chart = new Timelines('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Timelines chart', () => {
      it('should extract labels from the data array', function () {
        let result = chart.processBarLabels([
          { label: 'Feature A', status: 'done',      days: 10, start: 0  },
          { label: 'Feature B', status: 'todo',      days: 5,  start: 10 }
        ]);
        expect(result).to.eql(['Feature A', 'Feature B']);
      });
      it('should render without throwing', function () {
        chart.setData([{ label: 'A', status: 'done', days: 10, start: 0 }]);
        expect(() => chart.render()).to.not.throw();
      });
      it('should use horizontal bar chart', function () {
        expect(chart.conf.type).to.eql('bar');
        expect(chart.conf.options.indexAxis).to.eql('y');
      });
      it('should set bar labels on conf.data from setData', function () {
        chart.setData([
          { label: 'Theme group 1', status: 'inprogress', days: 30, start: 0  },
          { label: 'Theme group 2', status: 'todo',       days: 20, start: 30 }
        ]);
        expect(chart.conf.data.labels[1]).to.eql('Theme group 2');
      });
      it('should provide text from the intervalFormatter method', function () {
        chart.setLabels(['Sprint 0', 'Sprint 1'])
        expect(chart.intervalFormatter(1)).to.eql('Sprint 1');
      });
      it('should have the correct data', function () {
        chart.setData([
          { label: 'Theme group 1', status: 'inprogress', days: 30, start: 0  },
          { label: 'Theme group 2', status: 'todo',       days: 20, start: 30 }
        ]);
        const d = chart.getData();
        expect(d.length).to.eql(2);
        expect(d[0].label).to.eql('Theme group 1');
        expect(d[0].start).to.eql(0);
        expect(d[0].end).to.eql(3);
        expect(d[1].label).to.eql('Theme group 2');
        expect(d[1].start).to.eql(3);
        expect(d[1].end).to.eql(5);
      });
    });

})();
