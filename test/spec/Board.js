describe('Board', function () {
  let store, board;

  beforeEach(function () {
    localStorage.clear();
    store = new Store('team1', 'proj1');
    board = new Board(store);
    let panel = document.getElementById('panel-board');
    if (panel) panel.remove();
    panel = document.createElement('div');
    panel.id = 'panel-board';
    panel.className = 'tab-panel';
    document.body.appendChild(panel);
  });

  describe('_esc', function () {
    it('escapes ampersands', function () {
      assert.equal(board._esc('a & b'), 'a &amp; b');
    });
    it('escapes less-than', function () {
      assert.equal(board._esc('<script>'), '&lt;script&gt;');
    });
    it('escapes double quotes', function () {
      assert.equal(board._esc('"hi"'), '&quot;hi&quot;');
    });
    it('coerces non-strings', function () {
      assert.equal(board._esc(42), '42');
    });
  });

  describe('render', function () {
    it('renders four columns', function () {
      board.render('panel-board');
      assert.equal(document.querySelectorAll('.board-col').length, 4);
    });

    it('renders the add form in the backlog column only', function () {
      board.render('panel-board');
      assert.equal(document.querySelectorAll('.board-add-form').length, 1);
    });

    it('renders existing backlog cards', function () {
      store.addCard({ title: 'A', type: 'Story' });
      store.addCard({ title: 'B', type: 'Bug' });
      board.render('panel-board');
      assert.equal(document.querySelectorAll('.board-card').length, 2);
    });

    it('escapes card titles in HTML output', function () {
      store.addCard({ title: '<b>bold</b>', type: 'Story' });
      board.render('panel-board');
      assert.include(document.querySelector('.board-card-title').innerHTML, '&lt;b&gt;');
    });

    it('marks blocked cards with is-blocked class', function () {
      store.addCard({ title: 'X', type: 'Story', blocked: true });
      board.render('panel-board');
      assert.ok(document.querySelector('.board-card.is-blocked'));
    });

    it('does not mark non-blocked cards with is-blocked', function () {
      store.addCard({ title: 'X', type: 'Story', blocked: false });
      board.render('panel-board');
      assert.isNull(document.querySelector('.board-card.is-blocked'));
    });

    it('shows points badge when card has points', function () {
      store.addCard({ title: 'X', type: 'Story', points: 5 });
      board.render('panel-board');
      assert.ok(document.querySelector('.board-card-points'));
      assert.equal(document.querySelector('.board-card-points').textContent, '5');
    });

    it('omits points badge when card has no points', function () {
      store.addCard({ title: 'X', type: 'Story', points: 0 });
      board.render('panel-board');
      assert.isNull(document.querySelector('.board-card-points'));
    });

    it('shows load-more button when backlog exceeds page size', function () {
      for (let i = 0; i < 11; i++) store.addCard({ title: `C${i}`, type: 'Story' });
      board.render('panel-board');
      assert.ok(document.querySelector('.board-load-more'));
    });

    it('hides load-more when backlog is within page size', function () {
      store.addCard({ title: 'C', type: 'Story' });
      board.render('panel-board');
      assert.isNull(document.querySelector('.board-load-more'));
    });

    it('shows correct count in column header', function () {
      store.addCard({ title: 'A', type: 'Story' });
      store.addCard({ title: 'B', type: 'Story' });
      board.render('panel-board');
      const counts = document.querySelectorAll('.board-col-count');
      assert.equal(counts[0].textContent, '2');
    });

    it('is a no-op for an unknown container id', function () {
      assert.doesNotThrow(() => board.render('nonexistent'));
    });
  });

  describe('add card form', function () {
    it('adds a card to the store on submit', function () {
      board.render('panel-board');
      document.querySelector('.board-add-title').value = 'New card';
      document.querySelector('.board-add-type').value = 'Bug';
      document.querySelector('.board-add-points').value = '3';
      document.querySelector('.board-add-form').dispatchEvent(
        new window.Event('submit', { bubbles: true })
      );
      assert.equal(store.getCards().length, 1);
      assert.equal(store.getCards()[0].title, 'New card');
      assert.equal(store.getCards()[0].type, 'Bug');
      assert.equal(store.getCards()[0].points, 3);
    });

    it('does not add a card when title is empty', function () {
      board.render('panel-board');
      document.querySelector('.board-add-title').value = '';
      document.querySelector('.board-add-form').dispatchEvent(
        new window.Event('submit', { bubbles: true })
      );
      assert.equal(store.getCards().length, 0);
    });

    it('defaults points to 0 when points field is blank', function () {
      board.render('panel-board');
      document.querySelector('.board-add-title').value = 'No points';
      document.querySelector('.board-add-points').value = '';
      document.querySelector('.board-add-form').dispatchEvent(
        new window.Event('submit', { bubbles: true })
      );
      assert.equal(store.getCards()[0].points, 0);
    });
  });

  describe('blocked toggle', function () {
    it('marks a card as blocked when checkbox is checked', function () {
      store.addCard({ title: 'A', type: 'Story' });
      board.render('panel-board');
      const cb = document.querySelector('.board-card-blocked-cb');
      cb.checked = true;
      cb.dispatchEvent(new window.Event('change', { bubbles: true }));
      assert.equal(store.getCards()[0].blocked, true);
    });

    it('unmarks a card as blocked when checkbox is unchecked', function () {
      store.addCard({ title: 'A', type: 'Story', blocked: true });
      board.render('panel-board');
      const cb = document.querySelector('.board-card-blocked-cb');
      cb.checked = false;
      cb.dispatchEvent(new window.Event('change', { bubbles: true }));
      assert.equal(store.getCards()[0].blocked, false);
    });

    it('toggles is-blocked class on the card element', function () {
      store.addCard({ title: 'A', type: 'Story' });
      board.render('panel-board');
      const cb = document.querySelector('.board-card-blocked-cb');
      cb.checked = true;
      cb.dispatchEvent(new window.Event('change', { bubbles: true }));
      assert.ok(document.querySelector('.board-card').classList.contains('is-blocked'));
    });
  });

  describe('delete card', function () {
    it('removes the card from the store on delete click', function () {
      store.addCard({ title: 'A', type: 'Story' });
      board.render('panel-board');
      document.querySelector('.board-card-delete').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.equal(store.getCards().length, 0);
    });

    it('re-renders the board after deletion', function () {
      store.addCard({ title: 'A', type: 'Story' });
      store.addCard({ title: 'B', type: 'Story' });
      board.render('panel-board');
      document.querySelector('.board-card-delete').dispatchEvent(
        new window.Event('click', { bubbles: true })
      );
      assert.equal(document.querySelectorAll('.board-card').length, 1);
    });
  });

  describe('GitHub import mapper (mapGitHubIssueToCard)', function () {
    it('returns null for PRs', function () {
      const pr = { title: 'Fix it', pull_request: { url: 'x' } };
      assert.isNull(mapGitHubIssueToCard(pr));
    });

    it('returns null for empty title', function () {
      assert.isNull(mapGitHubIssueToCard({ title: '   ' }));
    });

    it('defaults to Story when no labels', function () {
      const c = mapGitHubIssueToCard({ title: 'Do the thing (5)' });
      assert.equal(c.type, 'Story');
      assert.equal(c.points, 5);
      assert.equal(c.status, 'backlog');
    });

    it('maps common labels to canonical types (scans all labels)', function () {
      const bug = mapGitHubIssueToCard({ title: 'Crash', labels: [{ name: 'defect' }, { name: 'priority' }] });
      assert.equal(bug.type, 'Bug');
      const story = mapGitHubIssueToCard({ title: 'Add auth', labels: [{ name: 'enhancement' }] });
      assert.equal(story.type, 'Story');
      const task = mapGitHubIssueToCard({ title: 'Update deps', labels: [{ name: 'chore' }] });
      assert.equal(task.type, 'Task');
      const spike = mapGitHubIssueToCard({ title: 'Research X', labels: [{ name: 'spike' }] });
      assert.equal(spike.type, 'Spike');
    });

    it('falls back to raw label name when no keyword match', function () {
      const c = mapGitHubIssueToCard({ title: 'Triage', labels: [{ name: 'needs-triage' }] });
      assert.equal(c.type, 'needs-triage');
    });

    it('parses points from title (parens, brackets, pts suffix)', function () {
      assert.equal(mapGitHubIssueToCard({ title: 'Foo (8)' }).points, 8);
      assert.equal(mapGitHubIssueToCard({ title: 'Bar (3 pts)' }).points, 3);
      assert.equal(mapGitHubIssueToCard({ title: 'Baz [13]' }).points, 13);
      assert.equal(mapGitHubIssueToCard({ title: 'Qux 5pts' }).points, 5);
    });

    it('falls back to body for points if absent from title', function () {
      const c = mapGitHubIssueToCard({ title: 'No num here', body: 'Estimate: (21)' });
      assert.equal(c.points, 21);
    });

    it('produces minimal card fields for Store.addCard', function () {
      const c = mapGitHubIssueToCard({ title: 'X (2)', labels: [{ name: 'bug' }] });
      assert.deepEqual(Object.keys(c).sort(), ['blocked', 'intervalId', 'points', 'status', 'title', 'type']);
      assert.equal(c.blocked, false);
      assert.equal(c.intervalId, null);
    });
  });
});
