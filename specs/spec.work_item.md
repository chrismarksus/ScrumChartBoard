# Work Item

## Overview

A work item (also referred to as a PBI, Card, or Ticket) represents a small chunk of work to be completed. Work items are created and managed in the Backlog (see `spec.backlog.md`).

---

## Fields

| Field | Type | Editable | Notes |
|---|---|---|---|
| ID | Integer | No | Auto-incremented at creation. Never reused. |
| Title | Text | Yes | Required. Short description of the work. |
| State | Enum | Yes | See valid states below. |
| Effort | Number | Yes | Story points. Optional (blank = unestimated). |
| Interval | Text | Yes | Sprint/iteration name the item is assigned to. Blank if unassigned. |
| Assigned To | Text | Yes | Free text for MVP. See future notes below. |
| Tags | Text | Yes | Comma-separated labels (e.g. "bug, frontend"). Blank if none. |
| Description | Long text | Yes | Free-text body describing the work. Optional. |
| Acceptance Criteria | Long text | Yes | Free-text definition of done. Optional. |
| Created At | Timestamp | No | Set at creation. Stored but not displayed in MVP. |
| Modified At | Timestamp | No | Updated on any field change. Stored but not displayed in MVP. |

### Valid States

- **Backlog** — created but not yet refined or planned
- **Ready** — refined and ready to be pulled into a sprint
- **In Progress** — actively being worked
- **Done** — completed
- **Cancelled** — will not be completed

New work items default to **Backlog** state.

---

## Detail Panel (read view)

Shown in the right panel of the Backlog page when a work item is selected. All fields are read-only here; editing opens a dialog.

### Layout

```
[ ID: 42 ]                              [ Edit ]
Title (large)
─────────────────────────────────────────────
State: In Progress   Effort: 5   Interval: Sprint 3
Assigned To: Jane Smith
Tags: frontend, bug
─────────────────────────────────────────────
Description
<text>

Acceptance Criteria
<text>
```

- The **Edit** button appears in the top-right of the panel.
- If a field is blank/empty, it is either hidden or shown with an em-dash (—) placeholder — TBD at design time.
- Tags are displayed as chips/pills when present, not raw comma-separated text.
- Created At and Modified At are not displayed in the MVP.

---

## Edit Dialog

Clicking **Edit** in the detail panel opens a dialog pre-populated with the current field values. The dialog is the same form as the Create Work Item dialog (see `spec.work_item_dialog.md`) with all fields filled in.

### Behavior

- **Save** — validates required fields, writes changes to localStorage, closes the dialog, and refreshes the detail panel and list row.
- **Cancel** — discards all changes and closes the dialog. No confirmation needed for cancel.
- If the **Title** is blank when Save is clicked, display an inline validation error on the Title field and do not close the dialog.
- Editing a work item updates its **Modified At** timestamp.
- **ID** is not shown as an editable field in the dialog (display-only if shown at all).

---

## Future / Out of Scope for MVP

- **Assigned To from team data** — a later feature will populate Assigned To from a team member list. That list will live on a dedicated Team page accessible via the main tab bar (see `spec.main_tabbar.md`). The field should be free text for now so data isn't blocked.
- **Acceptance Criteria as checklist** — checking off individual criteria could be added after MVP.
- **Comments / activity history** — not planned for MVP.
- **Created At / Modified At display** — timestamps are stored now so they're available when a display UI is added.
