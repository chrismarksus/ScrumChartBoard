class ThemeSwitcher {
  constructor() {
    this.key = 'scrum_theme_0001';
    this.palettes = ['forest', 'warm', 'electric', 'mono'];
    this.swatchColors = {
      forest:   '#d97757',
      warm:     '#2e7df0',
      electric: '#ff5d8f',
      mono:     '#8a857e'
    };
  }

  prefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key) || '{}');
      return { theme: saved.theme || 'light', palette: saved.palette || 'forest' };
    } catch { return { theme: 'light', palette: 'forest' }; }
  }

  save(update) {
    localStorage.setItem(this.key, JSON.stringify({ ...this.prefs(), ...update }));
  }

  applyAndReload(update) {
    this.save(update);
    window.location.reload();
  }

  setup() {
    const { theme, palette } = this.prefs();
    document.body.className = `theme-${theme} palette-${palette}`;

    const el = document.createElement('div');
    el.id = 'theme-switcher';
    el.innerHTML = `
      <button id="ts-mode" title="${theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}">
        ${theme === 'dark' ? '&#9788;' : '&#9790;'}
      </button>
      <div class="ts-divider"></div>
      <div class="ts-palettes">
        ${this.palettes.map(p => `<button class="ts-swatch${p === palette ? ' active' : ''}" data-palette="${p}" title="${p[0].toUpperCase() + p.slice(1)}" style="background:${this.swatchColors[p]}"></button>`).join('')}
      </div>`;
    document.body.appendChild(el);

    el.querySelector('#ts-mode').addEventListener('click', () => {
      this.applyAndReload({ theme: this.prefs().theme === 'light' ? 'dark' : 'light' });
    });

    el.querySelectorAll('.ts-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.palette !== this.prefs().palette) {
          this.applyAndReload({ palette: btn.dataset.palette });
        }
      });
    });
  }
}

export default ThemeSwitcher;
