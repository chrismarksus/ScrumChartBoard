class ThemeSwitcher {
  constructor() {
    this.key = 'scrum_theme_0001';
    this.palettes = [
      { id: 'forest',   label: 'Forest',   swatches: ['#6e8e4f', '#4a7c8a', '#d97757', '#a88b5c'] },
      { id: 'warm',     label: 'Warm',     swatches: ['#5fa15e', '#2e7df0', '#e57543', '#8a6cc7'] },
      { id: 'electric', label: 'Electric', swatches: ['#6cd9b8', '#5b6cff', '#ff5d8f', '#a45dff'] },
      { id: 'mono',     label: 'Mono',     swatches: ['#2a2723', '#6e6a62', '#1a1816', '#4a4642'] },
    ];
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

    const chips = this.palettes.map(p => `
      <button class="ts-chip${p.id === palette ? ' active' : ''}" data-palette="${p.id}" title="${p.label}" aria-label="${p.label}">
        <div class="ts-swatch">
          <i style="background:${p.swatches[2]}"></i>
          <i style="background:${p.swatches[1]}"></i>
          <i style="background:${p.swatches[0]}"></i>
          <i style="background:${p.swatches[3]}"></i>
        </div>
      </button>`).join('');

    const el = document.createElement('div');
    el.id = 'theme-switcher';
    el.innerHTML = `
      <div class="ts-palettes">${chips}</div>
      <div class="ts-divider"></div>
      <div class="ts-mode">
        <span class="${theme === 'light' ? 'active' : ''}" data-mode="light">LIGHT</span>
        <span class="${theme === 'dark' ? 'active' : ''}" data-mode="dark">DARK</span>
      </div>`;
    document.body.appendChild(el);

    el.querySelectorAll('.ts-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.palette !== this.prefs().palette) {
          this.applyAndReload({ palette: btn.dataset.palette });
        }
      });
    });

    el.querySelectorAll('.ts-mode span').forEach(span => {
      span.addEventListener('click', () => {
        if (span.dataset.mode !== this.prefs().theme) {
          this.applyAndReload({ theme: span.dataset.mode });
        }
      });
    });
  }
}

export default ThemeSwitcher;
