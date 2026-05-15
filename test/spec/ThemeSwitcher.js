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
  });

})();
