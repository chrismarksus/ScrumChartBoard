(function () {
  'use strict';

  let chart;
    beforeEach(() => {
      $('#sandbox').append('<p id="charts" style="height:100px;"></p>');
      chart = new Types('charts', 'Cat');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });

    describe('The Types chart', () => {
      it('should have an mLabel of Cat', function () {
        let result = chart.mLabel;
        expect(result).to.eql('Cat');
      });
    });

})();
