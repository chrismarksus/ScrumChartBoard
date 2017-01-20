(function () {
  'use strict';

    let scrum, model = null;
    let mockDoc = {title: 'test'};
    let statusMock  = sinon.mock(Charts);

    beforeEach(() => {
      sinon.spy(Handlebars, 'registerPartial');
      model =  new Model(mockData);
      scrum = new Scrum('sandbox', model, mockDoc);
    });
    afterEach(() => {
      scrum.destroy();
      scrum = null;
      mockDoc = {title: 'test'};
      Handlebars.registerPartial.restore();
      statusMock.restore();
    });

    describe('The Scrum App', () => {
      describe('should add handlebar partials', () => {
        it('should be chartGroupPartial added', () => {
          expect(Handlebars.registerPartial.calledWith('chartGroupPartial', App.templates.chartGroupPartial)).to.eql(true);
        });
        it('should be popupPartial added', () => {
          expect(Handlebars.registerPartial.calledWith('popupPartial', App.templates.popupPartial)).to.eql(true);
        });
        it('should be deckLinkPartial added', () => {
          expect(Handlebars.registerPartial.calledWith('deckLinkPartial', App.templates.deckLinkPartial)).to.eql(true);
        });
        it('should be backlogPartial added', () => {
          expect(Handlebars.registerPartial.calledWith('backlogPartial', App.templates.backlogPartial)).to.eql(true);
        });
        it('should be updatedPartial added', () => {
          expect(Handlebars.registerPartial.calledWith('updatedPartial', App.templates.updatedPartial)).to.eql(true);
        });
        it('should be velocity added', () => {
          expect(Handlebars.registerPartial.calledWith('velocity', App.templates.velocity)).to.eql(true);
        });
        it('should be workdays added', () => {
          expect(Handlebars.registerPartial.calledWith('workdays', App.templates.workdays)).to.eql(true);
        });
        it('should be capacity added', () => {
          expect(Handlebars.registerPartial.calledWith('capacity', App.templates.capacity)).to.eql(true);
        });
        it('should be blockTitleWithCount added', () => {
          expect(Handlebars.registerPartial.calledWith('blockTitleWithCount', App.templates.blockTitleWithCount)).to.eql(true);
        });
        it('should be estimatedCards added', () => {
          expect(Handlebars.registerPartial.calledWith('estimatedCards', App.templates.estimatedCards)).to.eql(true);
        });
      });
      it('should add Headliner to a container', function () {
        scrum.setup();
        expect($('#sandbox').text()).to.contain('TestDashboard');
        expect($('#sandbox').text()).to.contain('TestProject');
        expect($('#sandbox').text()).to.contain('TestTeam');
      });
      it('should change the document title of the html page', () => {
        scrum.setup();
        expect(mockDoc).to.eql({title: 'TestProject (TestTeam)'});
      });
      it('should add slide deck to a container', function () {
        scrum.setup();
        expect($('#sandbox').text()).to.contain('Sprint 1 (10/12/2016 - 10/13/2016)');
        expect($('#sandbox').text()).to.contain('Sprint 2 (11/12/2016 - 11/13/2016)');
      });
      it('should Add a backlog link if the data is available', () => {
        mockData.project.backlog = 'url/to/backlog';
        scrum.setup();
        expect($('#sandbox #backlog').text()).to.contain('Looking for the backlog?');
        expect($('#backlog a').attr('href')).to.eql(mockData.project.backlog);
      });
      it('should Add estimated cards', () => {
        scrum.setup();
        expect($('#sandbox #estimatedCards').text()).to.contain('Cards (10)');
        expect($('#sandbox #estimatedCards').text()).to.contain('6/4');
      });
      it('should Add velocity', () => {
        scrum.setup();
        expect($('#sandbox #velocity').text()).to.contain('Velocity');
        expect($('#sandbox #velocity').text()).to.contain('15');
      });
      it('should Add Capacity', () => {
        scrum.setup();
        expect($('#sandbox #capacity').text()).to.contain('Capacity Days');
        expect($('#sandbox #capacity').text()).to.contain('50');
        expect($('#sandbox #capacity').text()).to.contain('Total / Workdays / Timeboxes');
        expect($('#sandbox #capacity').text()).to.contain('27');
        expect($('#sandbox #capacity').text()).to.contain('2');
      });
    });

})();
