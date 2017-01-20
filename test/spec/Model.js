(function () {
  'use strict';

  let model, onChangeSpy;
  describe('The Model with no data', () => {
    beforeEach(() => {
      onChangeSpy = sinon.spy();
      model = new Model({
        intervals: [{
          'label': 'Sprint 1',
          'daysTimebox': [0],
          'daysOutPlanned': [0],
          'daysOutUnplanned':[0],
          'daysOutHolidays': 0
        }]
      }, () => {});
    });
    it('should provide total estimated cards',()=>{
      expect(model.cardsEstimated('Sprint 1')).to.eql(0);
    });
    it('should provide total unestimated cards',()=>{
      expect(model.cardsUnestimated('Sprint 1')).to.eql(0);
    });
    it('should provide total total cards',()=>{
      expect(model.cardsTotal('Sprint 1')).to.eql(0);
    });
    it('should return data for a capacity', function () {
      const data = model.capacity();
      expect(data.daysTimebox).to.eql(undefined);
      expect(data.daysOutPlanned).to.eql(undefined);
      expect(data.daysOutUnplanned).to.eql(undefined);
      expect(data.daysOutHolidays).to.eql(undefined);
    });
  });
  describe('The Model', () => {
    beforeEach(() => {
      onChangeSpy = sinon.spy();
      model = new Model(mockData, onChangeSpy);
    });
    it('should provide json data', function () {
      const data = {'hello': 'world'};
      const model = new Model();
      expect(model.data(data)).to.eql(data);
    });
    it('should provide a title',()=>{
      expect(model.title()).to.eql('TestProject (TestTeam)');
    });
    it('should provide total estimated cards',()=>{
      expect(model.cardsEstimated('Sprint 1')).to.eql(6);
    });
    it('should provide total unestimated cards',()=>{
      expect(model.cardsUnestimated('Sprint 1')).to.eql(4);
    });
    it('should provide total average velocity',()=>{
      expect(model.totalAverageVelocity('Sprint 1')).to.eql(15);
    });
    it('should provide person work days for a sprint',()=>{
      let result = model.personWorkDays('Sprint 1');
      expect(result).to.eql(41);
    });
    it('should provide total person work days for a sprint',()=>{
      let result = model.totalPersonWorkDays('Sprint 1');
      expect(result).to.eql(50);
    });
    it('should provide total timeboxes',()=>{
      expect(model.timeboxes('Sprint 1')).to.eql(1);
    });
    it('should provide predicted velocity',()=>{
      expect(model.predictedVelocity(50, 41, 13)).to.eql(10);
    });
    it('should find by interval label',()=>{
      expect(model.findByIntervalLabel('Sprint 2').label).to.eql('Sprint 2');
    });
    it('should add up array of numbers',()=>{
      expect(model.addUp(10,5)).to.eql(15);
    });
    it('should find a prop by name and add up and average by length',()=>{
      expect(model.findPropReduceByNameAverageByLength('thing 1', {
        'thing 1': [1,2,3,4]
      })).to.eql(2.5);
    });
    it('should find a prop by name in an array of objects',()=>{
      expect(model.getObjectPropInArrayByName('thing 1', [{
        'thing 1': 1
      },
      {
        'thing 1': 2
      },
      {
        'thing 1': 3
      }])).to.eql({'thing 1':[1,2,3]});
    });
    it('should find a prop by an array of names in an array of objects',()=>{
      expect(model.getObjectPropInArrayByName(['thing 1','thing 2'], [{
        'thing 1': 1,
        'thing 2': 2
      },
      {
        'thing 1': 3,
        'thing 2': 4
      }])).to.eql({'thing 1':[1,3],'thing 2':[2,4]});
    });
    describe('Call an onchange callback', () => {
      it('after update', function () {
        model.data({'hello':'world'});
        expect(onChangeSpy.called).to.eql(true);
      });
      it('to pass updated data', function () {
        const data = {'hello':'world'};
        model.data(data);
        expect(onChangeSpy.calledWith(data)).to.eql(true);
      });
    });

    describe('Chart data methods', () => {
      beforeEach(() => {
        model.data(mockData);
      });
      it('should return data for starting the dashboard template', function () {
        const data = model.dashboard('Sprint 1');
        expect(data.dashboardName).to.eql('TestDashboard');
        expect(data.projectName).to.eql('TestProject');
        expect(data.teamName).to.eql('TestTeam');
        expect(data.daysInInterval).to.eql(10);

        expect(data.totalAverageVelocity).to.be.an('number');
        expect(data.cardsEstimated).to.be.an('number');
        expect(data.cardsUnestimated).to.be.an('number');
        expect(data.cardsTotal).to.be.an('number');
        expect(data.personWorkDays).to.be.an('number');
        expect(data.totalPersonWorkDays).to.be.an('number');
        expect(data.predictedVelocity).to.be.an('number');
        //expect(data.).to.eql([]);
      });
      it('should return data for a satisfaction', function () {
        const data = model.satisfaction();
        expect(data).to.eql([{
          'label': 'team',
          'scores': [3.5,0,0]
        },{
          'label': 'shareholder',
          'scores': [7.5,0,0]
        }]);
      });
      it('should return data for a capacity', function () {
        const data = model.capacity();
        expect(data.daysTimebox).to.be.an('array');
        expect(data.daysOutPlanned).to.be.an('array');
        expect(data.daysOutUnplanned).to.be.an('array');
        expect(data.daysOutHolidays).to.be.an('array');
        expect(data.daysTimebox).to.be.an('array');
        expect(data.daysOutPlanned).to.be.an('array');
        expect(data.daysOutUnplanned).to.be.an('array');
        expect(data.daysWorked).to.be.an('array');
      });
      it('should return data for a intervalNotes', function () {
        const data = model.intervalNotes();
        expect(data.notesInterval).to.be.an('array');
        expect(data.notesInterval).to.eql(['url/to/md','url/to/md','url/to/md']);
      });
      it('should return data for a intervalData', function () {
        const data = model.intervalData();
        expect(data).to.be.an('object');
        expect(data.daysTimebox).to.eql(undefined);
        expect(data.issuesPerInterval).to.be.an('array');
        expect(data.cardsBlocked).to.be.an('array');
        expect(data.cardsEstimated).to.be.an('array');
        expect(data.cardsCompleted).to.be.an('array');
        expect(data.cardsCommited).to.be.an('array');
        expect(data.pointsCompleted).to.be.an('array');
        expect(data.pointsCommited).to.be.an('array');
        expect(data.pointsEstimated).to.be.an('array');
        expect(data.label).to.be.an('array');
        expect(data.dateEnd).to.be.an('array');
        expect(data.pointsCompletedTotaled).to.be.an('array');
        expect(data.cardsCompletedTotaled).to.be.an('array');
      });
      it('should return a label for lastIntervalLabel', function () {
        let result = model.lastIntervalLabel();
        expect(result).to.eql('Sprint 3');
      });

    });
  });

})();
