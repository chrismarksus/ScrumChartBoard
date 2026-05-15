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

    const chipsContainer = document.getElementById('ls-palette-chips');
    if (chipsContainer) {
      this.palettes.forEach(p => {
        const btn = document.createElement('button');
        btn.className = `ls-chip switcher-chip${p.id === palette ? ' is-active' : ''}`;
        btn.dataset.palette = p.id;
        btn.title = p.label;
        btn.setAttribute('aria-label', p.label);
        btn.innerHTML =
          `<div class="swatch">` +
          `<i style="background:${p.swatches[2]}"></i>` +
          `<i style="background:${p.swatches[1]}"></i>` +
          `<i style="background:${p.swatches[0]}"></i>` +
          `<i style="background:${p.swatches[3]}"></i>` +
          `</div>`;
        btn.addEventListener('click', () => {
          if (btn.dataset.palette !== this.prefs().palette) {
            this.applyAndReload({ palette: btn.dataset.palette });
          }
        });
        chipsContainer.appendChild(btn);
      });
    }

    document.querySelectorAll('.ls-mode-span').forEach(span => {
      span.classList.toggle('is-active', span.dataset.mode === theme);
      span.addEventListener('click', () => {
        if (span.dataset.mode !== this.prefs().theme) {
          this.applyAndReload({ theme: span.dataset.mode });
        }
      });
    });
  }
}

export default ThemeSwitcher;
