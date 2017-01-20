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
      it('should load json data and return a promise', function () {
        let server = sinon.fakeServer.create();
        let okResponse = [200,
          {'Content-type': 'application/json'},
          '{"hello":"world"}'
        ];

        server.respondWith('GET', '/hello', okResponse);
        getData.setup().done((d, p, i) => {
          if (err) {
            return done(err);
          }
          expect(d.hello).toBe('world');
          expect(p.hello).toBe('world');
          expect(i.hello).toBe('world');
          done();
        });
        server.respond();
        server.restore();
      });
    });

})();
