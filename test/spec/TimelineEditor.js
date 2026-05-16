describe('TimelineEditor', function () {
  let store, editor;

  beforeEach(function () {
    localStorage.clear();
    store = new Store('team1', 'proj1');
    editor = new TimelineEditor(store);
    let panel = document.getElementById('panel-timeline');
    if (panel) panel.remove();
    panel = document.createElement('div');
    panel.id = 'panel-timeline';
    panel.className = 'tab-panel';
    document.body.appendChild(panel);
  });

  describe('_esc', function () {
    it('escapes HTML in theme names', function () {
      assert.equal(editor._esc('<b>'), '&lt;b&gt;');
    });
  });

  describe('render', function () {
    it('shows the empty message when store has no intervals and no themes', function () {
      editor.render('panel-timeline');
      assert.ok(document.querySelector('.timeline-empty'));
    });

    it('renders the grid when intervals exist', function () {
      store.addInterval({ name: 'Sprint 1' });
      editor.render('panel-timeline');
      assert.ok(document.querySelector('.timeline-grid'));
    });

    it('renders the grid when themes exist even with no intervals', function () {
      store.addTimeline({ name: 'Theme A' });
      editor.render('panel-timeline');
      assert.ok(document.querySelector('.timeline-grid'));
    });

    it('renders one header column per interval', function () {
      store.addInterval({ name: 'Sprint 1' });
      store.addInterval({ name: 'Sprint 2' });
      editor.render('panel-timeline');
      assert.equal(document.querySelectorAll('.tl-col-iv').length, 2);
    });

    it('renders one row per theme', function () {
      store.addInterval({ name: 'Sprint 1' });
      store.addTimeline({ name: 'Theme A' });
      store.addTimeline({ name: 'Theme B' });
      editor.render('panel-timeline');
      assert.equal(document.querySelectorAll('tbody tr[data-id]').length, 2);
    });

    it('shows theme name in row', function () {
      store.addInterval({ name: 'Sprint 1' });
      store.addTimeline({ name: 'My Theme' });
      editor.render('panel-timeline');
      assert.include(document.querySelector('.tl-name').textContent, 'My Theme');
    });

    it('escapes theme names in output', function () {
      store.addInterval({ name: 'Sprint 1' });
      store.addTimeline({ name: '<b>bold</b>' });
      editor.render('panel-timeline');
      assert.include(document.querySelector('.tl-name').innerHTML, '&lt;b&gt;');
    });

    it('highlights cells within the theme interval range', function () {
      store.addInterval({ name: 'S1' });
      store.addInterval({ name: 'S2' });
      store.addInterval({ name: 'S3' });
      const t = store.addTimeline({ name: 'Theme A' });
      store.updateTimeline(t.id, { intervalStart: 0, intervalEnd: 1 });
      editor.render('panel-timeline');
      const cells = document.querySelectorAll('.tl-cell');
      assert.ok(cells[0].classList.contains('tl-active'));
      assert.ok(cells[1].classList.contains('tl-active'));
      assert.notOk(cells[2].classList.contains('tl-active'));
    });

    it('shows range selects when intervals exist', function () {
      store.addInterval({ name: 'Sprint 1' });
      store.addTimeline({ name: 'Theme A' });
      editor.render('panel-timeline');
      assert.ok(document.querySelector('.tl-start-sel'));
      assert.ok(document.querySelector('.tl-end-sel'));
    });

    it('is a no-op for an unknown container id', function () {
      assert.doesNotThrow(() => editor.render('nonexistent'));
    });
  });

  describe('add theme form', function () {
    it('form is hidden by default', function () {
      editor.render('panel-timeline');
      assert.isNull(document.querySelector('.timeline-add-form'));
    });

    it('clicking + Add Theme shows the form', function () {
      editor.render('panel-timeline');
      document.querySelector('.timeline-add-btn').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.ok(document.querySelector('.timeline-add-form'));
    });

    it('submitting the form adds a theme to the store', function () {
      editor._showAddForm = true;
      editor.render('panel-timeline');
      document.querySelector('.timeline-f-name').value = 'New Theme';
      document.querySelector('.timeline-add-form').dispatchEvent(
        new window.Event('submit', { bubbles: true })
      );
      assert.equal(store.getTimelines().length, 1);
      assert.equal(store.getTimelines()[0].name, 'New Theme');
    });

    it('does not add a theme with empty name', function () {
      editor._showAddForm = true;
      editor.render('panel-timeline');
      document.querySelector('.timeline-f-name').value = '';
      document.querySelector('.timeline-add-form').dispatchEvent(
        new window.Event('submit', { bubbles: true })
      );
      assert.equal(store.getTimelines().length, 0);
    });

    it('cancel hides the form', function () {
      editor._showAddForm = true;
      editor.render('panel-timeline');
      document.querySelector('.timeline-f-cancel').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.isNull(document.querySelector('.timeline-add-form'));
    });
  });

  describe('status cycle', function () {
    it('cycles todo → inprogress on click', function () {
      store.addInterval({ name: 'Sprint 1' });
      store.addTimeline({ name: 'Theme A' });
      editor.render('panel-timeline');
      document.querySelector('.tl-status-btn').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.equal(store.getTimelines()[0].status, 'inprogress');
    });

    it('cycles inprogress → done on click', function () {
      store.addInterval({ name: 'Sprint 1' });
      const t = store.addTimeline({ name: 'Theme A' });
      store.updateTimeline(t.id, { status: 'inprogress' });
      editor.render('panel-timeline');
      document.querySelector('.tl-status-btn').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.equal(store.getTimelines()[0].status, 'done');
    });

    it('cycles done → todo on click', function () {
      store.addInterval({ name: 'Sprint 1' });
      const t = store.addTimeline({ name: 'Theme A' });
      store.updateTimeline(t.id, { status: 'done' });
      editor.render('panel-timeline');
      document.querySelector('.tl-status-btn').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.equal(store.getTimelines()[0].status, 'todo');
    });
  });

  describe('range selects', function () {
    it('changing start select clamps end to stay >= start', function () {
      store.addInterval({ name: 'S1' });
      store.addInterval({ name: 'S2' });
      store.addInterval({ name: 'S3' });
      const t = store.addTimeline({ name: 'Theme A' });
      store.updateTimeline(t.id, { intervalStart: 0, intervalEnd: 0 });
      editor.render('panel-timeline');
      const startSel = document.querySelector('.tl-start-sel');
      startSel.value = '2';
      startSel.dispatchEvent(new window.Event('change', { bubbles: true }));
      const updated = store.getTimelines()[0];
      assert.equal(updated.intervalStart, 2);
      assert.equal(updated.intervalEnd, 2);
    });

    it('changing end select clamps start to stay <= end', function () {
      store.addInterval({ name: 'S1' });
      store.addInterval({ name: 'S2' });
      store.addInterval({ name: 'S3' });
      const t = store.addTimeline({ name: 'Theme A' });
      store.updateTimeline(t.id, { intervalStart: 2, intervalEnd: 2 });
      editor.render('panel-timeline');
      const endSel = document.querySelector('.tl-end-sel');
      endSel.value = '0';
      endSel.dispatchEvent(new window.Event('change', { bubbles: true }));
      const updated = store.getTimelines()[0];
      assert.equal(updated.intervalStart, 0);
      assert.equal(updated.intervalEnd, 0);
    });
  });

  describe('delete theme', function () {
    it('removes the theme from the store', function () {
      store.addInterval({ name: 'Sprint 1' });
      store.addTimeline({ name: 'Theme A' });
      editor.render('panel-timeline');
      document.querySelector('.tl-del-btn').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.equal(store.getTimelines().length, 0);
    });

    it('re-renders after deletion', function () {
      store.addInterval({ name: 'Sprint 1' });
      store.addTimeline({ name: 'Theme A' });
      store.addTimeline({ name: 'Theme B' });
      editor.render('panel-timeline');
      document.querySelector('.tl-del-btn').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.equal(document.querySelectorAll('tbody tr[data-id]').length, 1);
    });
  });
});
