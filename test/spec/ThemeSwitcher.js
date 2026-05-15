(function () {
  'use strict';

  const KEY = 'scrum_theme_0001';

  describe('ThemeSwitcher', () => {
    let switcher;

    beforeEach(() => {
      localStorage.removeItem(KEY);
      switcher = new ThemeSwitcher();
    });

    describe('prefs()', () => {
      it('returns light theme and forest palette by default', () => {
        expect(switcher.prefs()).to.eql({ theme: 'light', palette: 'forest' });
      });
      it('returns saved theme', () => {
        localStorage.setItem(KEY, JSON.stringify({ theme: 'dark', palette: 'forest' }));
        expect(switcher.prefs().theme).to.eql('dark');
      });
      it('returns saved palette', () => {
        localStorage.setItem(KEY, JSON.stringify({ theme: 'light', palette: 'warm' }));
        expect(switcher.prefs().palette).to.eql('warm');
      });
      it('returns defaults when localStorage contains invalid JSON', () => {
        localStorage.setItem(KEY, 'not-json');
        expect(switcher.prefs()).to.eql({ theme: 'light', palette: 'forest' });
      });
    });

    describe('save()', () => {
      it('persists theme to localStorage', () => {
        switcher.save({ theme: 'dark' });
        expect(switcher.prefs().theme).to.eql('dark');
      });
      it('persists palette to localStorage', () => {
        switcher.save({ palette: 'electric' });
        expect(switcher.prefs().palette).to.eql('electric');
      });
      it('merges partial updates without clobbering other prefs', () => {
        switcher.save({ theme: 'dark' });
        switcher.save({ palette: 'mono' });
        const p = switcher.prefs();
        expect(p.theme).to.eql('dark');
        expect(p.palette).to.eql('mono');
      });
    });

    describe('apply()', () => {
      beforeEach(() => {
        document.body.className = '';
      });
      afterEach(() => {
        document.body.className = '';
      });

      it('saves preference when reload is false', () => {
        const sw = new ThemeSwitcher({ reload: false });
        sw.apply({ theme: 'dark', palette: 'warm' });
        expect(sw.prefs()).to.eql({ theme: 'dark', palette: 'warm' });
      });
      it('updates body class when reload is false', () => {
        const sw = new ThemeSwitcher({ reload: false });
        sw.apply({ theme: 'dark', palette: 'electric' });
        expect(document.body.className).to.include('theme-dark');
        expect(document.body.className).to.include('palette-electric');
      });
      describe('when reload is true', () => {
        let origDescriptor;
        beforeEach(() => {
          const proto = Object.getPrototypeOf(window.location);
          origDescriptor = Object.getOwnPropertyDescriptor(proto, 'reload');
          Object.defineProperty(proto, 'reload', { configurable: true, writable: true, value: () => {} });
        });
        afterEach(() => {
          if (origDescriptor) {
            Object.defineProperty(Object.getPrototypeOf(window.location), 'reload', origDescriptor);
          }
        });

        it('saves preference', () => {
          const sw = new ThemeSwitcher({ reload: true });
          sw.apply({ palette: 'mono' });
          expect(sw.prefs().palette).to.equal('mono');
        });
        it('does not update body class', () => {
          document.body.className = 'theme-light palette-forest';
          const sw = new ThemeSwitcher({ reload: true });
          sw.apply({ palette: 'mono' });
          expect(document.body.className).to.equal('theme-light palette-forest');
        });
      });
    });

    describe('setup()', () => {
      let chipsEl;

      beforeEach(() => {
        chipsEl = document.createElement('div');
        chipsEl.id = 'ls-palette-chips';
        document.body.appendChild(chipsEl);
      });
      afterEach(() => {
        chipsEl.remove();
        document.querySelectorAll('.ls-mode-span, .palette-card').forEach(el => el.remove());
        document.body.className = '';
      });

      it('populates palette chips container with 4 buttons', () => {
        switcher.setup();
        expect(chipsEl.querySelectorAll('button.ls-chip').length).to.equal(4);
      });
      it('marks the active chip matching the saved palette', () => {
        localStorage.setItem(KEY, JSON.stringify({ theme: 'light', palette: 'warm' }));
        new ThemeSwitcher({ reload: false }).setup();
        const active = chipsEl.querySelector('.ls-chip.is-active');
        expect(active).to.not.be.null;
        expect(active.dataset.palette).to.equal('warm');
      });
      it('marks the active mode span matching the saved theme', () => {
        localStorage.setItem(KEY, JSON.stringify({ theme: 'dark', palette: 'forest' }));
        const span = document.createElement('span');
        span.className = 'ls-mode-span';
        span.dataset.mode = 'dark';
        document.body.appendChild(span);
        new ThemeSwitcher({ reload: false }).setup();
        expect(span.classList.contains('is-active')).to.be.true;
      });
      it('marks the active palette card matching the saved palette', () => {
        localStorage.setItem(KEY, JSON.stringify({ theme: 'light', palette: 'electric' }));
        const card = document.createElement('div');
        card.className = 'palette-card';
        card.dataset.palette = 'electric';
        document.body.appendChild(card);
        new ThemeSwitcher({ reload: false }).setup();
        expect(card.classList.contains('is-active')).to.be.true;
      });
    });
  });

})();
