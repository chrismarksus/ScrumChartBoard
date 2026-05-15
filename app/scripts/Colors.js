// app/scripts/Colors.js
//
// ScrumChartBoard — chart colour palette.
//
// The active palette is controlled by body classes set via ThemeSwitcher
// (e.g. `theme-light palette-forest`). Slots 0–5 are read from CSS custom
// properties at construction time so Chart.js canvases pick up the correct
// palette after a page reload. Slots 6–12 are fixed values used for
// secondary chart elements (gridlines, legend, dark-mode background).
//
// Indices map to semantic names via `this.names`:
//   0  done            (theme[0])
//   1  todo            (theme[1])
//   2  inprogress      (theme[2])
//   3  satisfaction    (theme[3])
//   4  default         (theme[4])
//   5  hover (blocked) (theme[5])
//   6  tan             (theme[6])
//   7  darkblue        (theme[7])
//   8  gridlines       (theme[8])
//   9  legendlines     (theme[9])
//   10 lightblue       (theme[10])
//   11 cream           (theme[11])
//   12 background      (theme[12])

class Colors {
  constructor(bgc = 'light', arr) {
    let background;

    // Read semantic colors from CSS custom properties (set by palette body class).
    // Falls back to forest palette values when CSS vars are unavailable (test env).
    const cssVar = (prop, fallback) => {
      try {
        const v = getComputedStyle(document.body).getPropertyValue(prop).trim();
        return v || fallback;
      } catch { return fallback; }
    };

    this.theme = arr || [
      cssVar('--c-done',         '#6e8e4f'),  // 0  done
      cssVar('--c-todo',         '#4a7c8a'),  // 1  todo
      cssVar('--c-inprogress',   '#d97757'),  // 2  inprogress
      cssVar('--c-satisfaction', '#a88b5c'),  // 3  satisfaction
      cssVar('--c-default',      '#6fa8b8'),  // 4  default
      cssVar('--c-hover',        '#b85c4a'),  // 5  hover (blocked)
      '#c4a473',  // 6  tan
      '#2d4a5c',  // 7  darkblue
      '#545454',  // 8  gridlines
      '#666666',  // 9  legendlines
      '#cfdde2',  // 10 lightblue
      '#f5f0e3',  // 11 cream
      '#002b36'   // 12 background (dark mode)
    ];

    this.names = {
      'done':         this.theme[0],
      'todo':         this.theme[1],
      'inprogress':   this.theme[2],
      'background':   this.theme[12],
      'gridlines':    this.theme[8],
      'hover':        this.theme[5],
      'satisfaction': this.theme[3],
      'legendlines':  this.theme[9]
    };
    this.bgc = bgc;
    background = this.background();
    this.theme[12] = background;
  }

  background() {
    return (this.bgc === 'dark') ? this.theme[12] : '#ffffff';
  }
  getLabel() {
    return (this.bgc === 'dark') ? this.theme[11] : this.theme[8];
  }
  getTheme() {
    return this.theme;
  }
  satisfaction(num = 1) {
    if (num === 1) return this.theme[3];
    if (num === 2) return [this.theme[7], this.theme[3]];
  }
  done()       { return this.theme[0]; }
  todo()       { return this.theme[1]; }
  inprogress() { return this.theme[2]; }
  hover()      { return this.theme[5]; }
  grid()       { return this.theme[8]; }
  legend()     { return this.theme[9]; }

  progress(rev = false) {
    const result = [this.inprogress(), this.todo(), this.done(), this.hover()];
    if (rev) result.reverse();
    return result;
  }
  projection() {
    return [this.inprogress(), this.done(), this.theme[10]];
  }
  statusToColor(value) {
    switch (value.toLowerCase()) {
      case 'done':        return this.theme[0];
      case 'todo':        return this.theme[1];
      case 'inprogress':
      case 'in-progress': return this.theme[2];
      default:            return this.theme[4];
    }
  }
}

export default Colors;


/* ──────────────────────────────────────────────────────────────
   REFERENCE — hex values for each palette (slots 0–5).
   Palette switching is handled automatically via CSS custom
   properties and the ThemeSwitcher body class. These arrays
   are here for reference or for passing an explicit `arr` in tests.

   ── WARM (orange + blue, modern) ──────────────────────────────
   [
     '#5fa15e','#2e7df0','#e57543','#8a6cc7','#5dbdd1','#d65a5a',
     '#a89968','#1f3a6b','#545454','#666666','#c5d8f2','#f5f0e3','#002b36'
   ]

   ── ELECTRIC (pink + indigo) ──────────────────────────────────
   [
     '#6cd9b8','#5b6cff','#ff5d8f','#a45dff','#5dd3ff','#ff8b3d',
     '#c79a5e','#2b2f6b','#545454','#666666','#d9dcff','#f5f0e3','#0e0e1a'
   ]

   ── MONO (neutral only) ───────────────────────────────────────
   [
     '#2a2723','#6e6a62','#1a1816','#4a4642','#b8b3a8','#8a857e',
     '#a89e91','#2a2723','#545454','#666666','#d9d3c5','#f5f0e3','#002b36'
   ]
   ────────────────────────────────────────────────────────────── */
