(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
      chart = new Status('charts', 'Cat');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Status chart', () => {
      it('should set color to a progress array', function () {
        let result = chart.conf.colors;
        expect(result).to.eql(['#e46c0a', '#376092', '#77933c']);
      });
      it('should have an mLabel of Cat', function () {
        let result = chart.mLabel;
        expect(result).to.eql('Cat');
      });
    });

})();
