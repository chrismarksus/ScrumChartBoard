describe('Store', function () {
  let store;

  beforeEach(function () {
    localStorage.clear();
    store = new Store('team1', 'proj1');
  });

  it('initializes with empty arrays', function () {
    assert.deepEqual(store.getCards(), []);
    assert.deepEqual(store.getIntervals(), []);
    assert.deepEqual(store.getTimelines(), []);
  });

  it('uses separate keys for different team/project pairs', function () {
    store.addCard({ title: 'A', type: 'Story' });
    const other = new Store('team2', 'proj2');
    assert.equal(other.getCards().length, 0);
  });

  it('handles corrupted localStorage gracefully', function () {
    localStorage.setItem('scrum_board_team1_proj1', 'not-json');
    const s = new Store('team1', 'proj1');
    assert.deepEqual(s.getCards(), []);
  });

  describe('cards', function () {
    it('adds a card with default fields', function () {
      const card = store.addCard({ title: 'T', type: 'Story', points: 3 });
      assert.equal(card.title, 'T');
      assert.equal(card.status, 'backlog');
      assert.equal(card.blocked, false);
      assert.isNull(card.intervalId);
      assert.isString(card.id);
    });

    it('getCards returns a copy — mutations do not affect the store', function () {
      store.addCard({ title: 'A', type: 'Story' });
      store.getCards().push({ title: 'injected' });
      assert.equal(store.getCards().length, 1);
    });

    it('updates a card by id', function () {
      const card = store.addCard({ title: 'A', type: 'Story' });
      store.updateCard(card.id, { status: 'done', blocked: true });
      const updated = store.getCards()[0];
      assert.equal(updated.status, 'done');
      assert.equal(updated.blocked, true);
    });

    it('update is a no-op for unknown id', function () {
      store.addCard({ title: 'A', type: 'Story' });
      store.updateCard('nonexistent', { status: 'done' });
      assert.equal(store.getCards()[0].status, 'backlog');
    });

    it('removes a card by id', function () {
      const card = store.addCard({ title: 'A', type: 'Story' });
      store.removeCard(card.id);
      assert.equal(store.getCards().length, 0);
    });

    it('persists cards across Store instances', function () {
      store.addCard({ title: 'A', type: 'Story' });
      const store2 = new Store('team1', 'proj1');
      assert.equal(store2.getCards().length, 1);
      assert.equal(store2.getCards()[0].title, 'A');
    });
  });

  describe('intervals', function () {
    it('adds an interval with default fields', function () {
      const iv = store.addInterval({ name: 'Sprint 1', startDate: '2026-01-01', endDate: '2026-01-14' });
      assert.equal(iv.name, 'Sprint 1');
      assert.equal(iv.active, false);
      assert.isString(iv.id);
    });

    it('updates an interval by id', function () {
      const iv = store.addInterval({ name: 'Sprint 1' });
      store.updateInterval(iv.id, { active: true });
      assert.equal(store.getIntervals()[0].active, true);
    });

    it('removes an interval by id', function () {
      const iv = store.addInterval({ name: 'Sprint 1' });
      store.removeInterval(iv.id);
      assert.equal(store.getIntervals().length, 0);
    });
  });

  describe('sync()', function () {
    let _originalFetch;

    beforeEach(function () {
      _originalFetch = global.fetch;
    });

    afterEach(function () {
      global.fetch = _originalFetch;
      Store.apiBase = null;
    });

    it('resolves immediately when apiBase is not set', function () {
      return store.sync();
    });

    it('loads server state into the store when apiBase is set', function () {
      const serverData = {
        cards: [{ id: 'srv1', title: 'Server card', type: 'Story', status: 'backlog', blocked: false, intervalId: null }],
        intervals: [],
        timelines: []
      };
      global.fetch = sinon.stub().resolves({
        ok: true,
        json: () => Promise.resolve(serverData)
      });
      Store.apiBase = 'http://localhost:3001';
      return store.sync().then(() => {
        assert.equal(store.getCards().length, 1);
        assert.equal(store.getCards()[0].title, 'Server card');
      });
    });

    it('persists server state to localStorage after sync', function () {
      const serverData = { cards: [], intervals: [{ id: 'iv1', name: 'Sprint 1', active: false }], timelines: [] };
      global.fetch = sinon.stub().resolves({ ok: true, json: () => Promise.resolve(serverData) });
      Store.apiBase = 'http://localhost:3001';
      return store.sync().then(() => {
        const saved = JSON.parse(localStorage.getItem('scrum_board_team1_proj1'));
        assert.equal(saved.intervals[0].name, 'Sprint 1');
      });
    });

    it('keeps localStorage state when the server returns a non-ok response', function () {
      store.addCard({ title: 'Local card', type: 'Story' });
      global.fetch = sinon.stub().resolves({ ok: false });
      Store.apiBase = 'http://localhost:3001';
      return store.sync().then(() => {
        assert.equal(store.getCards().length, 1);
        assert.equal(store.getCards()[0].title, 'Local card');
      });
    });

    it('keeps localStorage state when fetch throws', function () {
      store.addCard({ title: 'Local card', type: 'Story' });
      global.fetch = sinon.stub().rejects(new Error('Network error'));
      Store.apiBase = 'http://localhost:3001';
      return store.sync().then(() => {
        assert.equal(store.getCards().length, 1);
      });
    });

    it('ignores server response with invalid shape', function () {
      store.addCard({ title: 'Local card', type: 'Story' });
      global.fetch = sinon.stub().resolves({ ok: true, json: () => Promise.resolve({ broken: true }) });
      Store.apiBase = 'http://localhost:3001';
      return store.sync().then(() => {
        assert.equal(store.getCards().length, 1);
      });
    });

    it('includes team and project as query params in the fetch URL', function () {
      global.fetch = sinon.stub().resolves({ ok: false });
      Store.apiBase = 'http://localhost:3001';
      return store.sync().then(() => {
        const url = global.fetch.firstCall.args[0];
        assert.include(url, 'team=team1');
        assert.include(url, 'project=proj1');
      });
    });
  });

  describe('timelines', function () {
    it('adds a timeline with default fields', function () {
      const t = store.addTimeline({ name: 'Theme A' });
      assert.equal(t.name, 'Theme A');
      assert.equal(t.status, 'todo');
      assert.equal(t.intervalStart, 0);
      assert.equal(t.intervalEnd, 0);
      assert.isString(t.id);
    });

    it('updates a timeline by id', function () {
      const t = store.addTimeline({ name: 'Theme A' });
      store.updateTimeline(t.id, { status: 'inprogress', intervalEnd: 3 });
      assert.equal(store.getTimelines()[0].status, 'inprogress');
      assert.equal(store.getTimelines()[0].intervalEnd, 3);
    });

    it('removes a timeline by id', function () {
      const t = store.addTimeline({ name: 'Theme A' });
      store.removeTimeline(t.id);
      assert.equal(store.getTimelines().length, 0);
    });
  });
});
