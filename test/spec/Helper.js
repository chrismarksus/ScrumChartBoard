(function () {
  'use strict';

  let helper;
    beforeEach(() => {
      helper = new Helper();
    });
    afterEach(() => {
    });

    describe('The Helper', () => {
      it('should provide a date formated by mm/dd/yyyy', function () {
        expect(helper.mmddyyyy('Tue, 20 Dec 2016 16:28:00')).to.eql('12/20/2016');
      });
      it('should provide a query a windows get value from a url', function () {
        let winMock = {
          removeEventListener: () => {},
          location: {
            search:'?test=tom'
          }
        };
        let result = helper.queryString('test', winMock);
        expect(result).to.eql('tom');
      });
      it('should calcPercentage 200', function () {
        let result = helper.calcPercentage(100, 50);
        expect(result).to.eql(200);
      });
      it('should calcPercentage 50', function () {
        let result = helper.calcPercentage(50, 100);
        expect(result).to.eql(50);
      });
      it('should calcPercentage 25 ', function () {
        let result = helper.calcPercentage(25, 100);
        expect(result).to.eql(25);
      });
      it('should calcPercentage zero ', function () {
        let result = helper.calcPercentage(0, 25);
        expect(result).to.eql(0);
      });
      it('should calcPercentage 2500 ', function () {
        let result = helper.calcPercentage(25, 0);
        expect(result).to.eql(2500);
      });
    });
})();
