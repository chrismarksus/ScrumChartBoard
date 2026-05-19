# Timeline Editor

## Overview

The Timeline Editor is a Gantt-style view for tracking themes or epics across intervals. Each row is a theme; each column is an interval. Cells are highlighted to show which intervals a theme spans, and a status badge tracks overall progress.

Themes persist to `localStorage` under key `scrum_board_{team}_{project}` and optionally sync to the REST server (see `spec.persistence.md`). Intervals come from the same Store shared with the Board and Interval Planner.

---

## Navigation

Accessed by clicking the **Timeline** tab in the main tab bar (see `spec.main_tabbar.md`). Renders into `#panel-timeline`.

Requires `?team=` and `?project=` query params.

---

## Layout

### Header

- **Title**: "Timeline"
- **+ Add Theme** button — toggles the add-theme form inline below the header

### Add Theme Form (toggled)

Shown when "+ Add Theme" is clicked; hidden on Cancel or successful submit:
- **Theme name** — text input, required
- **Add** — submit button
- **Cancel** — hides the form without creating a theme

### Empty State

If there are no intervals AND no themes: shows _"Create intervals in the Interval Planner, then add themes here."_ No table is rendered.

### Grid Table

A `<table>` with a fixed column structure:

| Column | Header | Content |
|--------|--------|---------|
| Theme | "Theme" | Theme name (HTML-escaped) |
| Status | "Status" | Clickable status badge |
| One column per interval | Interval name | Highlighted cell if interval is within the theme's range |
| Range | "Range" | Start/end interval selectors |
| (delete) | _(empty)_ | `×` delete button |

**Empty row state:** If intervals exist but no themes yet, a full-width row shows _"No themes yet — click **+ Add Theme** to create one."_

**If no intervals but themes exist:** The Range column shows _"Add intervals first"_ (plain text, no selectors).

### Status badge

Each theme has a status button that displays the current status label and applies a matching CSS class:

| Status key | Label |
|-----------|-------|
| `todo` | To Do |
| `inprogress` | In Progress |
| `done` | Done |

### Interval cells

Each interval gets a `<td>`. If the interval's index falls within `[theme.intervalStart, theme.intervalEnd]` (inclusive), the cell receives:
- `.tl-active` class
- `.tl-{status}` class (matching the theme's current status)

Otherwise the cell is unstyled.

### Range selectors

Two `<select>` dropdowns per theme row:
- **Start** (`.tl-start-sel`) — options are all interval names, selected option is `theme.intervalStart` index
- **End** (`.tl-end-sel`) — options are all interval names, selected option is `theme.intervalEnd` index

An arrow (`→`) separates the two selectors.

---

## Behavior

### Adding a theme

Submitting the add-theme form:
1. Creates a theme with a UUID `id`, `status: 'todo'`, `intervalStart: 0`, `intervalEnd: 0`
2. Saves to Store
3. Hides the form and re-renders

Empty name is rejected (browser `required` validation). New themes always start spanning only the first interval (index 0 → 0).

### Cycling status

Clicking a theme's status badge advances it through the cycle: **To Do → In Progress → Done → To Do…**

The update is saved and the row re-renders immediately.

### Setting the range

Changing the **Start** selector:
- Sets `intervalStart` to the selected index
- If the new start is after the current end, `intervalEnd` is advanced to match (end cannot be before start)

Changing the **End** selector:
- Sets `intervalEnd` to the selected index
- If the new end is before the current start, `intervalStart` is pulled back to match (start cannot be after end)

Both adjustments are saved and the grid re-renders.

### Deleting a theme

Clicking `×` removes the theme from Store and re-renders. No confirmation dialog.

### Persistence

Every mutation calls `Store._save()` — writes to `localStorage` and fires a silent `POST /board` if `Store.apiBase` is set.

---

## Out of Scope for MVP

- Editing a theme's name after creation
- Confirmation before deleting a theme
- Reordering theme rows
- Sub-themes or hierarchical grouping
- Colour-coding themes independently of status
- Showing card counts or point totals per theme/interval cell
- Exporting the timeline as an image or PDF
