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
      it('should call $.getJSON with all three data paths', function () {
        let getJSONStub = sinon.stub($, 'getJSON');
        let whenSpy = sinon.spy($, 'when');
        getData.setup();
        expect(getJSONStub.callCount).to.eql(3);
        expect(getJSONStub.getCall(0).args[0]).to.eql('teams/Bob/dashboard.json');
        expect(getJSONStub.getCall(1).args[0]).to.eql('teams/Bob/projects/Cat/project.json');
        expect(getJSONStub.getCall(2).args[0]).to.eql('teams/Bob/projects/Cat/intervals.json');
        expect(whenSpy.called).to.eql(true);
        getJSONStub.restore();
        whenSpy.restore();
      });
    });

})();
