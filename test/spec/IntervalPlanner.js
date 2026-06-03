describe('IntervalPlanner', function () {
  let store, planner;

  beforeEach(function () {
    localStorage.clear();
    store = new Store('team1', 'proj1');
    planner = new IntervalPlanner(store);
    let panel = document.getElementById('panel-planner');
    if (panel) panel.remove();
    panel = document.createElement('div');
    panel.id = 'panel-planner';
    panel.className = 'tab-panel';
    document.body.appendChild(panel);
  });

  describe('render', function () {
    it('renders the unassigned drop zone', function () {
      planner.render('panel-planner');
      assert.ok(document.querySelector('.planner-drop-zone[data-interval-id=""]'));
    });

    it('shows empty message when there are no intervals', function () {
      planner.render('panel-planner');
      assert.ok(document.querySelector('.planner-empty'));
    });

    it('renders a lane for each interval', function () {
      store.addInterval({ name: 'Sprint 1' });
      store.addInterval({ name: 'Sprint 2' });
      planner.render('panel-planner');
      assert.equal(document.querySelectorAll('.planner-lane').length, 2);
    });

    it('shows unassigned backlog cards in the unassigned zone', function () {
      store.addCard({ title: 'A', type: 'Story', status: 'backlog' });
      planner.render('panel-planner');
      const zone = document.querySelector('.planner-drop-zone[data-interval-id=""]');
      assert.equal(zone.querySelectorAll('.board-card').length, 1);
    });

    it('does not show non-backlog cards in the unassigned zone', function () {
      store.addCard({ title: 'A', type: 'Story', status: 'inprogress' });
      planner.render('panel-planner');
      const zone = document.querySelector('.planner-drop-zone[data-interval-id=""]');
      assert.equal(zone.querySelectorAll('.board-card').length, 0);
    });

    it('shows assigned cards in the correct interval lane', function () {
      const iv = store.addInterval({ name: 'Sprint 1' });
      const card = store.addCard({ title: 'A', type: 'Story', status: 'backlog' });
      store.updateCard(card.id, { intervalId: iv.id });
      planner.render('panel-planner');
      const zone = document.querySelector(`.planner-drop-zone[data-interval-id="${iv.id}"]`);
      assert.equal(zone.querySelectorAll('.board-card').length, 1);
    });

    it('shows the correct point total per lane', function () {
      const iv = store.addInterval({ name: 'Sprint 1' });
      const c1 = store.addCard({ title: 'A', type: 'Story', points: 3 });
      const c2 = store.addCard({ title: 'B', type: 'Story', points: 5 });
      store.updateCard(c1.id, { intervalId: iv.id });
      store.updateCard(c2.id, { intervalId: iv.id });
      planner.render('panel-planner');
      assert.include(document.querySelector('.planner-lane-pts').textContent, '8');
    });

    it('marks the active interval lane with is-active class', function () {
      store.addInterval({ name: 'Sprint 1', active: true });
      planner.render('panel-planner');
      assert.ok(document.querySelector('.planner-lane.is-active'));
    });

    it('is a no-op for an unknown container id', function () {
      assert.doesNotThrow(() => planner.render('nonexistent'));
    });
  });

  describe('new interval form', function () {
    it('form is hidden by default', function () {
      planner.render('panel-planner');
      assert.isNull(document.querySelector('.planner-new-form'));
    });

    it('clicking + New Interval shows the form', function () {
      planner.render('panel-planner');
      document.querySelector('.planner-new-btn').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.ok(document.querySelector('.planner-new-form'));
    });

    it('creating an interval adds it to the store', function () {
      planner._showForm = true;
      planner.render('panel-planner');
      document.querySelector('.planner-f-name').value = 'Sprint 3';
      document.querySelector('.planner-f-start').value = '2026-06-01';
      document.querySelector('.planner-f-end').value = '2026-06-14';
      document.querySelector('.planner-new-form').dispatchEvent(
        new window.Event('submit', { bubbles: true })
      );
      assert.equal(store.getIntervals().length, 1);
      assert.equal(store.getIntervals()[0].name, 'Sprint 3');
    });

    it('does not create an interval when name is empty', function () {
      planner._showForm = true;
      planner.render('panel-planner');
      document.querySelector('.planner-f-name').value = '';
      document.querySelector('.planner-new-form').dispatchEvent(
        new window.Event('submit', { bubbles: true })
      );
      assert.equal(store.getIntervals().length, 0);
    });

    it('cancel hides the form', function () {
      planner._showForm = true;
      planner.render('panel-planner');
      document.querySelector('.planner-f-cancel').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.isNull(document.querySelector('.planner-new-form'));
    });
  });

  describe('set active interval', function () {
    it('marks the clicked interval as active and clears others', function () {
      const iv1 = store.addInterval({ name: 'Sprint 1', active: true });
      const iv2 = store.addInterval({ name: 'Sprint 2' });
      planner.render('panel-planner');
      const btns = document.querySelectorAll('.planner-active-btn');
      btns[1].dispatchEvent(new window.Event('click', { bubbles: true }));
      assert.equal(store.getIntervals().find(iv => iv.id === iv1.id).active, false);
      assert.equal(store.getIntervals().find(iv => iv.id === iv2.id).active, true);
    });
  });

  describe('delete interval', function () {
    it('removes the interval from the store', function () {
      store.addInterval({ name: 'Sprint 1' });
      planner.render('panel-planner');
      document.querySelector('.planner-del-lane').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.equal(store.getIntervals().length, 0);
    });

    it('unassigns cards from the deleted interval', function () {
      const iv = store.addInterval({ name: 'Sprint 1' });
      const card = store.addCard({ title: 'A', type: 'Story' });
      store.updateCard(card.id, { intervalId: iv.id });
      planner.render('panel-planner');
      document.querySelector('.planner-del-lane').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.isNull(store.getCards()[0].intervalId);
    });
  });

  describe('capacity (Phase 1)', function () {
    it('supports capacity on create via form', function () {
      planner._showForm = true;
      planner.render('panel-planner');
      document.querySelector('.planner-f-name').value = 'Sprint C';
      document.querySelector('.planner-f-capacity').value = '13';
      document.querySelector('.planner-new-form').dispatchEvent(
        new window.Event('submit', { bubbles: true })
      );
      const iv = store.getIntervals()[0];
      assert.equal(iv.name, 'Sprint C');
      assert.equal(iv.capacity, 13);
    });

    it('renders capacity in lane pts as "X pts / CAP" and shows over warning banner + icon when exceeded (non-done)', function () {
      const iv = store.addInterval({ name: 'Sprint Cap', capacity: 5 });
      store.addCard({ title: 'Big', points: 8, intervalId: iv.id, status: 'todo' }); // committed
      planner.render('panel-planner');
      const ptsEl = document.querySelector('.planner-lane-pts');
      assert.include(ptsEl.textContent, '8 pts / 5');
      // banner
      assert.ok(document.querySelector('.capacity-warning'));
      assert.include(document.querySelector('.capacity-warning').textContent, 'Over-allocated on Sprint Cap by 3');
      // lane warning icon present
      assert.ok(document.querySelector('.planner-warning'));
    });

    it('does not count done cards toward committed for capacity warnings', function () {
      const iv = store.addInterval({ name: 'Sprint Cap2', capacity: 5 });
      store.addCard({ title: 'Big', points: 8, intervalId: iv.id, status: 'done' });
      planner.render('panel-planner');
      // no over warning because done excluded
      assert.isNull(document.querySelector('.capacity-warning'));
      const ptsEl = document.querySelector('.planner-lane-pts');
      assert.include(ptsEl.textContent, '8 pts / 5'); // still shows total, but warning not triggered
    });

    it('save edit persists capacity change', function () {
      const iv = store.addInterval({ name: 'Sprint E', capacity: 10 });
      planner._editingId = iv.id;
      planner.render('panel-planner');
      const capInput = document.querySelector('.planner-edit-capacity');
      capInput.value = '4';
      document.querySelector('.planner-save-edit').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      const updated = store.getIntervals().find(i => i.id === iv.id);
      assert.equal(updated.capacity, 4);
    });
  });
});
