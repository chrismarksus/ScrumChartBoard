# Backlog

## Navigation

Accessed by clicking the Backlog tab in the main tab bar (see `spec.main_tabbar.md`).

## Overview

The backlog is where work items (PBIs, Cards, Tickets) are created and organized by priority. Work items represent small chunks of work that need to be completed. For detailed field definitions and editing behavior, see `spec.work_item.md`.

Data is persisted to `localStorage` for the MVP. See `spec.persistence.md` for the storage schema, key names, and abstraction interface.

---

## Layout

The page has two areas:

- **Toolbar** — a single bar spanning the top of the page, always visible
- **Content area** — changes based on whether work items exist

### Empty state (no work items)

The content area displays a message: *"No work items yet. Click + to create your first item."* The toolbar is visible but the Delete and priority buttons are disabled.

### Populated state (one or more work items)

The content area splits into two panels:

- **Left panel** — the work item list (table)
- **Right panel** — the detail area for the selected work item (see `spec.work_item.md`)

---

## Toolbar

One toolbar for the entire page. Controls are grouped into two sections:

**Work item controls**
- **+ (Create)** — always enabled; opens the Create Work Item dialog (see `spec.work_item_dialog.md`)
- **Delete** — enabled only when one or more work items are selected; triggers the confirm-delete dialog before deleting (see `spec.confirm_delete.md`)

**Priority controls** — enabled only when one or more work items are selected
- **Up one** — moves the selected item(s) up one position
- **Down one** — moves the selected item(s) down one position
- **To top** — moves the selected item(s) to the top of the list
- **To bottom** — moves the selected item(s) to the bottom of the list

When multiple items are selected, all priority controls move the entire selection as a block, preserving their relative order within the block.

---

## Work Item List (left panel)

### Columns

| Column | Description |
|---|---|
| ID | Auto-incremented integer assigned at creation (1, 2, 3 …). Never reused. |
| Title | Short description of the work item |
| Effort | Story points (numeric) |
| State | One of: Backlog, Ready, In Progress, Done, Cancelled |
| Interval | The sprint/iteration the item is assigned to, or blank if unassigned |

### Order

Items are displayed in priority order (highest priority at top). Priority is the canonical sort; no other column sorting is supported in the MVP.

### Selection

- **Single click** — selects that item and deselects any previously selected items
- **Shift + click** — selects a contiguous range from the last-clicked item to the clicked item; preserves the anchor point for subsequent shift-clicks
- Clicking empty space in the list deselects all items
- **Ctrl + click** (non-contiguous multi-select) is not supported in the MVP.

### Drag to reprioritize

Work items can be dragged up or down within the list to change their priority. Dragging a single item moves only that item. Dragging an item that is part of a multi-selection moves the entire selection as a block.

---

## Detail Area (right panel)

When exactly one item is selected, its full detail is shown in the right panel. See `spec.work_item.md` for the fields, layout, and editing behavior.

When multiple items are selected, the right panel shows the detail of the first item in the selection (the anchor — i.e. the item that was clicked first, not the highest-priority item in the group).

When no items are selected, the right panel is empty or shows a prompt such as *"Select a work item to view details."*

When a new item is created via the + button, it is auto-selected immediately and its detail is shown in the right panel (see `spec.work_item_dialog.md` for the full save behavior).

---

## Delete behavior

Deleting one or more work items always requires confirmation via the confirm-delete dialog (see `spec.confirm_delete.md`). This applies regardless of whether deletion was triggered by the Delete toolbar button or the **Delete key** keyboard shortcut.

- **Delete key** — when one or more items are selected, pressing the Delete key is equivalent to clicking the Delete toolbar button: it opens the confirm-delete dialog before any data is removed.

---

## Out of scope for MVP

- Filtering or searching work items
- Sorting by columns other than priority
- Paging through large lists (see `spec.paging.md` — to be created)
- Backend persistence (localStorage only for now)
