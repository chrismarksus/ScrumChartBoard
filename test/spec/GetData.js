(function () {
  'use strict';

  let getData;
    beforeEach(() => {
      getData = new GetData('Bob', 'Cat');
    });
    afterEach(() => {
    });

    describe('The GetData', () => {
      it('should create a intervals path attribute', function () {
        expect(getData.dashboard).to.eql('teams/Bob/dashboard.json');
      });
      it('should create a project path attribute', function () {
        expect(getData.project).to.eql('teams/Bob/projects/Cat/project.json');
      });
      it('should create a intervals path attribute', function () {
        expect(getData.intervals).to.eql('teams/Bob/projects/Cat/intervals.json');
      });
      it('should call fetchJson with all three data paths', function () {
        let stub = sinon.stub(getData, 'fetchJson').returns(Promise.resolve([{}, {}]));
        getData.setup();
        expect(stub.callCount).to.eql(3);
        expect(stub.getCall(0).args[0]).to.eql('teams/Bob/dashboard.json');
        expect(stub.getCall(1).args[0]).to.eql('teams/Bob/projects/Cat/project.json');
        expect(stub.getCall(2).args[0]).to.eql('teams/Bob/projects/Cat/intervals.json');
        stub.restore();
      });
    });

})();
