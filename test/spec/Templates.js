(function () {
  'use strict';

  describe('Templates', () => {

    describe('dashboardHeader()', () => {
      it('renders dashboard name in h1', () => {
        const out = Templates.dashboardHeader({ dashboardName: 'My Board', projectName: 'P', teamName: 'T' });
        expect(out).to.include('<h1 class="headline">My Board</h1>');
      });
      it('renders project name in h2', () => {
        const out = Templates.dashboardHeader({ dashboardName: 'D', projectName: 'My Project', teamName: 'T' });
        expect(out).to.include('<h2 class="headline project">My Project</h2>');
      });
      it('renders team name in h5', () => {
        const out = Templates.dashboardHeader({ dashboardName: 'D', projectName: 'P', teamName: 'My Team' });
        expect(out).to.include('<h5 class="headline team">My Team</h5>');
      });
    });

    describe('chartGroupPartial()', () => {
      it('renders chart container with the given label', () => {
        const out = Templates.chartGroupPartial({ label: 'burndown', title: 'Burnup', tagname: 'h5' });
        expect(out).to.include('id="burndown"');
      });
      it('renders a heading when title is provided', () => {
        const out = Templates.chartGroupPartial({ label: 'burndown', title: 'Burnup', tagname: 'h5' });
        expect(out).to.include('<h5 class="chart title">Burnup');
      });
      it('renders a description link by default', () => {
        const out = Templates.chartGroupPartial({ label: 'burndown', title: 'Burnup', tagname: 'h5' });
        expect(out).to.include('class="description"');
      });
      it('omits description link when nodescription is set', () => {
        const out = Templates.chartGroupPartial({ label: 'burndown', title: 'Burnup', tagname: 'h5', nodescription: true });
        expect(out).to.not.include('class="description"');
      });
      it('omits heading when title is falsy', () => {
        const out = Templates.chartGroupPartial({ label: 'burndown', tagname: 'h5' });
        expect(out).to.not.include('<h5');
      });
    });

    describe('deckLinkPartial()', () => {
      it('renders a primary button when review is present', () => {
        const out = Templates.deckLinkPartial({ label: 'SPR 1', review: 'http://example.com' });
        expect(out).to.include('class="button button-primary"');
        expect(out).to.include('href="http://example.com"');
      });
      it('renders a plain button when review is absent', () => {
        const out = Templates.deckLinkPartial({ label: 'SPR 1' });
        expect(out).to.include('class="button"');
        expect(out).to.not.include('button-primary');
      });
      it('renders date range in label when dateStart is provided', () => {
        const out = Templates.deckLinkPartial({ label: 'SPR 1', dateStart: '01/01', dateEnd: '01/14' });
        expect(out).to.include('SPR 1 (01/01 - 01/14)');
      });
      it('renders just the label when dateStart is absent', () => {
        const out = Templates.deckLinkPartial({ label: 'SPR 1' });
        expect(out).to.include('>SPR 1<');
      });
    });

    describe('velocity()', () => {
      it('renders current and predicted velocity', () => {
        const out = Templates.velocity({ totalAverageVelocity: 15, predictedVelocity: 8 });
        expect(out).to.include('15/8');
        expect(out).to.include('class="number"');
      });
    });

    describe('capacity()', () => {
      it('renders total / workdays / timeboxes', () => {
        const out = Templates.capacity({ totalPersonWorkDays: 50, personWorkDays: 27, timeboxes: 2 });
        expect(out).to.include('<span>50</span>/<span>27</span>/<span>2</span>');
      });
    });

    describe('estimatedCards()', () => {
      it('renders estimated percentage', () => {
        const out = Templates.estimatedCards({ cardsEstimatedPercentage: 80, cardsEstimated: 8, cardsUnestimated: 2 });
        expect(out).to.include('80%');
      });
      it('renders estimated and unestimated counts', () => {
        const out = Templates.estimatedCards({ cardsEstimatedPercentage: 80, cardsEstimated: 8, cardsUnestimated: 2 });
        expect(out).to.include('Estimated (8) / Unestimated (2)');
      });
    });

    describe('updatedPartial()', () => {
      it('renders updater name and date', () => {
        const out = Templates.updatedPartial({ updatedName: 'Alice', updatedDate: '01/01/2026' });
        expect(out).to.include('By: Alice Updated: 01/01/2026');
      });
    });

    describe('backlogPartial()', () => {
      it('renders backlog link', () => {
        const out = Templates.backlogPartial({ backlog: 'http://backlog.example.com' });
        expect(out).to.include('href="http://backlog.example.com"');
        expect(out).to.include('Backlog');
      });
    });

    describe('popupPartial()', () => {
      it('renders popup id from label', () => {
        const out = Templates.popupPartial({ label: 'myChart', title: 'My Popup', content: '<p>info</p>' });
        expect(out).to.include('id="myChartDescription"');
      });
      it('renders popup title', () => {
        const out = Templates.popupPartial({ label: 'myChart', title: 'My Popup', content: '' });
        expect(out).to.include('My Popup');
      });
      it('renders popup content', () => {
        const out = Templates.popupPartial({ label: 'myChart', title: 'T', content: '<p>hello</p>' });
        expect(out).to.include('<p>hello</p>');
      });
    });

    describe('nodata()', () => {
      it('always renders DOH! heading', () => {
        expect(Templates.nodata({ links: [] })).to.include('DOH!');
      });
      it('renders sample data link when no prior links exist', () => {
        const out = Templates.nodata({ links: [] });
        expect(out).to.include('team=abc&project=sample');
      });
      it('renders previous project links when links are provided', () => {
        const out = Templates.nodata({ links: [{ team: 'myteam', project: 'myproject' }] });
        expect(out).to.include('team=myteam');
        expect(out).to.include('project=myproject');
      });
      it('renders multiple previous project links', () => {
        const out = Templates.nodata({ links: [
          { team: 'a', project: 'p1' },
          { team: 'b', project: 'p2' },
        ]});
        expect(out).to.include('team=a');
        expect(out).to.include('team=b');
      });
    });

  });

})();
