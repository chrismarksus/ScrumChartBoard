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
    });

})();
