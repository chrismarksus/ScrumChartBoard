(function () {
  'use strict';

    let scrum, model = null;
    let mockDoc = {title: 'test'};
    let statusMock  = sinon.mock(Charts);

    beforeEach(() => {
      model =  new Model(mockData);
      scrum = new Scrum('sandbox', model, mockDoc);
    });
    afterEach(() => {
      scrum.destroy();
      scrum = null;
      mockDoc = {title: 'test'};
      statusMock.restore();
    });

    describe('The Scrum App', () => {
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
        expect($('#sandbox #estimatedCards').text()).to.contain('60%');
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

  const tableFixture = {
    pointsCommited:    [10, 7, 15],
    pointsCompleted:   [10, 5, 30],
    pointsEstimated:   [40, 40, 40],
    cardsCommited:     [4, 0, 5],
    cardsCompleted:    [4, 0, 7],
    cardsBlocked:      [2, 2, 2],
    issuesPerInterval: [1, 1, 1],
    label:             ['Sprint 1', 'Sprint 2', 'Sprint 3'],
    dateEnd:           ['10/13/2016', '11/13/2016', '12/13/2016']
  };

  describe('Scrum.pointsChartInput', () => {
    it('returns two datasets referencing table arrays', () => {
      const { data } = Scrum.pointsChartInput(tableFixture);
      expect(data[0]).to.eql({ label: 'Commited', data: tableFixture.pointsCommited });
      expect(data[1]).to.eql({ label: 'Completed', data: tableFixture.pointsCompleted });
    });
    it('returns labels keyed by table property names', () => {
      const { labels } = Scrum.pointsChartInput(tableFixture);
      expect(labels.pointsCommited).to.eql('Commited');
      expect(labels.pointsCompleted).to.eql('Completed');
    });
  });

  describe('Scrum.cardsChartInput', () => {
    it('returns two datasets referencing table arrays', () => {
      const { data } = Scrum.cardsChartInput(tableFixture);
      expect(data[0]).to.eql({ label: 'Commited', data: tableFixture.cardsCommited });
      expect(data[1]).to.eql({ label: 'Completed', data: tableFixture.cardsCompleted });
    });
    it('returns labels keyed by table property names', () => {
      const { labels } = Scrum.cardsChartInput(tableFixture);
      expect(labels.cardsCommited).to.eql('Commited');
      expect(labels.cardsCompleted).to.eql('Completed');
    });
  });

  describe('Scrum.cardsBlockedInput', () => {
    it('wraps cardsBlocked array in a keyed data object', () => {
      const { data } = Scrum.cardsBlockedInput(tableFixture);
      expect(data.cardsBlocked).to.eql(tableFixture.cardsBlocked);
    });
    it('returns a label for the cardsBlocked key', () => {
      const { labels } = Scrum.cardsBlockedInput(tableFixture);
      expect(labels.cardsBlocked).to.eql('Cards Blocked');
    });
  });

  describe('Scrum.burndownInput', () => {
    it('returns [pointsCompleted, pointsEstimated]', () => {
      const result = Scrum.burndownInput(tableFixture);
      expect(result).to.eql([tableFixture.pointsCompleted, tableFixture.pointsEstimated]);
    });
  });

  describe('Scrum.issuesPerIntervalInput', () => {
    it('wraps issuesPerInterval array in a keyed data object', () => {
      const { data } = Scrum.issuesPerIntervalInput(tableFixture);
      expect(data.issuesPerInterval).to.eql(tableFixture.issuesPerInterval);
    });
    it('returns a label for the issuesPerInterval key', () => {
      const { labels } = Scrum.issuesPerIntervalInput(tableFixture);
      expect(labels.issuesPerInterval).to.eql('Issues Per Sprint');
    });
  });

  describe('Scrum.capacityKeys', () => {
    it('returns label map for all five capacity series', () => {
      const keys = Scrum.capacityKeys();
      expect(keys.daysTimebox).to.eql('Timeboxes');
      expect(keys.daysOutHolidays).to.eql('Holidays');
      expect(keys.daysOutPlanned).to.eql('Planned');
      expect(keys.daysOutUnplanned).to.eql('Unplanned');
      expect(keys.daysWorked).to.eql('Capacity');
    });
  });

})();
