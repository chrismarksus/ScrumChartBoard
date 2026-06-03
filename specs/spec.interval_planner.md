# Interval Planner

## Overview

The Interval Planner is a sprint-planning view that lets users create intervals (sprints) and assign backlog cards to them by dragging. It reads from the same `Store` as the Board and Timeline Editor, so intervals and card assignments made here are reflected across all tabs.

Intervals persist to `localStorage` under key `scrum_board_{team}_{project}` and optionally sync to the REST server (see `spec.persistence.md`).

---

## Navigation

Accessed by clicking the **Interval Planner** tab in the main tab bar (see `spec.main_tabbar.md`). Renders into `#panel-planner`.

Requires `?team=` and `?project=` query params.

---

## Layout

A two-panel layout inside a `.planner-wrap`:

### Header

- **Title**: "Interval Planner"
- **+ New Interval** button — toggles the new-interval form inline below the header

### New Interval Form (toggled)

Shown when "+ New Interval" is clicked; hidden again on Cancel or successful submit:
- **Interval name** — text input, required
- **Start date** — date picker, optional
- **End date** — date picker, optional
- **Create** — submit button
- **Cancel** — hides the form without creating an interval

### Left panel — Unassigned (`.planner-unassigned`)

Shows all cards that have `status: 'backlog'` and no `intervalId` set.

- Header: "Unassigned" label + count of unassigned cards
- Drop zone (`.planner-drop-zone[data-interval-id=""]`) — cards can be dragged here from any interval lane to un-assign them

### Right panel — Interval Lanes (`.planner-lanes`)

One lane per interval, in creation order.

**Empty state:** If no intervals exist, shows: _"No intervals yet — click **+ New Interval** to create one."_

Each lane (`.planner-lane`) shows:
- **Interval name**
- **Date range** — shown as `startDate – endDate` if `startDate` is set; omitted otherwise
- **Point total** — sum of `points` for all cards assigned to this interval
- **Set active / Active ✓ button** — marks this interval as the active one; only one interval can be active at a time. The active lane receives `.is-active` styling.
- **Delete button** (`×`) — removes the interval
- **Drop zone** — cards can be dragged in or out

### Card representation

Cards in both panels show a compact form (no blocked checkbox, no delete button — those are Board-only interactions):
- Type badge
- Points badge (if set)
- Title

---

## Behavior

### Creating an interval

Submitting the new-interval form:
1. Creates an interval with a UUID `id`, `active: false`, and the entered name/startDate/endDate
2. Saves to Store
3. Hides the form and re-renders

Empty name is rejected (browser `required` validation). Start and end dates are optional.

### Setting the active interval

Clicking "Set active" on a lane:
1. Sets `active: true` on that interval and `active: false` on all others (mutually exclusive)
2. Re-renders

The active interval determines which interval ID is assigned to a card when it is dragged to the **To Do** column in the Board (see `spec.board.md`).

### Deleting an interval

Clicking `×` on a lane:
1. All cards assigned to that interval have their `intervalId` set to `null` (they move to Unassigned)
2. The interval is removed from Store
3. Re-renders

There is no confirmation dialog.

### Dragging cards

All drop zones (Unassigned + every lane) are SortableJS targets in the same `group: 'planner'`.

On drop:
- Card's `intervalId` is set to the destination lane's `data-interval-id` (empty string becomes `null` for Unassigned)
- Re-renders

Dragging between lanes updates only `intervalId`; `status` is not changed here.

### Persistence

Every mutation calls `Store._save()` — writes to `localStorage` and fires a silent `POST /board` if `Store.apiBase` is set.

---

## Out of Scope for MVP

- Confirmation before deleting an interval (added in board/planner polish)
- Reordering intervals
- Velocity-based recommended point targets
- Filtering cards in the Unassigned panel

**Phase 1 additions (finished remaining MVP items):**
- Editing interval name/dates + capacity (inline ✎ or dblclick; capacity field supported in create/edit and used for warnings).
- Capacity warnings: banner + lane icons when non-done committed points exceed the interval's `capacity` (pts). Warnings are non-blocking and recompute on render (drag/status changes reflected on tab switch or planner actions). See roadmap.
