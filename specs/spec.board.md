# Board

## Overview

The Board is a Kanban-style card management view within the main app. It shares a `Store` instance with the Interval Planner and Timeline Editor, so cards created or moved here are immediately visible in those tabs.

Cards persist to `localStorage` under key `scrum_board_{team}_{project}` and optionally sync to the REST server if `Store.apiBase` is set (see `spec.persistence.md`).

---

## Navigation

Accessed by clicking the **Board** tab in the main tab bar (see `spec.main_tabbar.md`). Renders into `#panel-board`.

Requires `?team=` and `?project=` query params — the Board panel is only initialised when both are present.

---

## Layout

A horizontal row of four fixed columns, always in this left-to-right order:

| Column | Status key | Notes |
|--------|-----------|-------|
| Backlog | `backlog` | Contains the add-card form; supports pagination |
| To Do | `todo` | — |
| In Progress | `inprogress` | — |
| Done | `done` | — |

### Column header

Each column header shows:
- Column label (Backlog / To Do / In Progress / Done)
- Total card count for that column (all cards, not just visible ones)

### Add-card form (Backlog column only)

An inline form at the top of the Backlog column:
- **Title** — text input, required
- **Type** — select: Story, Bug, Task, Spike (in that order)
- **Points** — number input, optional, min 0, integer steps, placeholder "pts"
- **Add** — submit button

### Card

Each card displays:
- **Type** badge (top-left)
- **Points** badge (top-right) — omitted if 0 or unset
- **Title** — HTML-escaped
- **Blocked checkbox** — labelled "Blocked"; checking/unchecking immediately updates the card and applies/removes the `is-blocked` visual state
- **Delete button** (`×`) — removes the card immediately with no confirmation

Cards in the `is-blocked` state receive a distinct visual treatment (`.is-blocked` class).

### Backlog pagination

The Backlog column shows 10 cards at a time. If there are more, a **"Load N more"** button appears at the bottom of the column, where N is the number of hidden cards. Clicking it increases the visible limit by 10 and re-renders. The limit grows as new cards are added (it always expands to show the full count after an add).

---

## Behavior

### Adding a card

Submitting the add-card form:
1. Creates a card with `status: 'backlog'`, `blocked: false`, `intervalId: null`, a UUID `id`, and the entered title/type/points
2. Saves to Store (localStorage + optional REST sync)
3. Re-renders the board

Empty title is rejected (browser `required` validation).

### Dragging cards

All four columns are SortableJS drop targets in the same `group: 'board'`, so cards can be dragged freely between any columns.

On drop:
1. The card's `status` is updated to the destination column's `data-status`
2. If the destination column is **To Do** and an interval is marked active in Store, the card's `intervalId` is set to that active interval's ID
3. The board re-renders

Cards dragged out of To Do (back to Backlog, or forward to In Progress/Done) retain their `intervalId`; it is not cleared.

### Blocking / unblocking

Checking or unchecking a card's Blocked checkbox immediately calls `Store.updateCard()` with `{ blocked: true/false }` and toggles the `.is-blocked` class on the card element — no full re-render.

### Deleting a card

Clicking `×` calls `Store.removeCard()` and re-renders the board. There is no confirmation dialog.

### Persistence

Every mutation (add, update, remove) calls `Store._save()`, which writes to `localStorage` and fires a `POST /board` to the REST server if `Store.apiBase` is set. Failures are silently ignored.

### Import (CSV / GitHub / State, Phase 1)

Board backlog supports:
- Import CSV (title/type/points/blocked/status/intervalId; quote-aware parser; downloadable rich sample CSVs).
- "Import GitHub" (inline form: owner/repo + optional PAT; fetches open issues, skips PRs; label scan for type (bug→Bug etc, default Story), points from (N)/[N]/Npts in title or body; always lands in backlog).
- Import State (full {cards,intervals,timelines} JSON roundtrip from Export State).

Standalone equivalent in JSON Editor ("Import from GitHub", Load board state). Uses shared mapper for consistency. See Board.js (mapGitHubIssueToCard + _import*), editor.js, Store.importState, samples/, and roadmap for details. Pure client, no server proxy.

---

## Out of Scope for MVP

- Editing a card's title, type, or points after creation
- Confirmation dialog before deleting a card
- Card detail / expand view
- Filtering or searching cards
- Sorting cards within a column (beyond drag order)
- Assigned-to field (depends on Teams tab — see `spec.work_item.md`)
- Card archiving
- Keyboard accessibility for drag-and-drop
