# Work Item Dialog

## Overview

A shared dialog form used for both creating and editing work items. It is opened from the Backlog toolbar (create mode) or from the work item detail panel (edit mode). See `spec.backlog.md` and `spec.work_item.md` for the triggering context.

---

## Triggering the Dialog

- **Create mode** — clicking the + button in the Backlog toolbar opens the dialog with all fields blank except State, which defaults to **Backlog**.
- **Edit mode** — clicking Edit in the work item detail panel opens the same dialog pre-populated with the item's current field values.

---

## Dialog Layout

```
┌─────────────────────────────────────────────┐
│ Create Work Item                        [✕] │
├─────────────────────────────────────────────┤
│ Title *                                     │
│ [                                         ] │
│                                             │
│ State                Effort                 │
│ [Backlog ▾]          [     ]  story points  │
│                                             │
│ Interval                                    │
│ [                                         ] │
│                                             │
│ Assigned To                                 │
│ [                                         ] │
│                                             │
│ Tags                                        │
│ [                           ] comma-separated│
│                                             │
│ Description                                 │
│ [                                         ] │
│ [                                         ] │
│ [                                         ] │
│                                             │
│ Acceptance Criteria                         │
│ [                                         ] │
│ [                                         ] │
│ [                                         ] │
│                                             │
│              [Cancel]       [Save]          │
└─────────────────────────────────────────────┘
```

- Title is marked as required with an asterisk.
- State is a dropdown showing all valid states.
- Effort is a numeric input; blank means unestimated.
- Description and Acceptance Criteria are multi-line text areas.
- Tags accepts a comma-separated string (e.g. `bug, frontend`).

---

## Field Defaults (Create mode)

| Field | Default |
|---|---|
| Title | Blank |
| State | Backlog |
| Effort | Blank |
| Interval | Blank |
| Assigned To | Blank |
| Tags | Blank |
| Description | Blank |
| Acceptance Criteria | Blank |

---

## Validation

- **Title** is the only required field. If blank when Save is clicked, display an inline error message below the Title field ("Title is required") and keep the dialog open. Focus returns to the Title field.
- No other fields are validated for MVP.

---

## Save Behavior

### Create mode
1. Assign the next available auto-incremented ID.
2. Set **Created At** and **Modified At** to the current timestamp.
3. Insert the new item at the **top** of the backlog list (highest priority).
4. Close the dialog.
5. Auto-select the new item — it becomes the selected item in the list and its detail appears in the right panel.

### Edit mode
1. Apply all changed field values to the existing work item.
2. Update **Modified At** to the current timestamp. **Created At** and **ID** are unchanged.
3. Close the dialog.
4. The item remains selected; the detail panel refreshes to show the updated values.
5. If the Title or any list-column field (State, Effort, Interval) changed, the corresponding cell in the backlog list row updates immediately.

---

## Cancel Behavior

Clicking **Cancel** or the **✕** button discards all changes and closes the dialog. No confirmation is shown. Previous selection state is preserved.

---

## Dialog Title

- **Create mode**: "Create Work Item"
- **Edit mode**: "Edit Work Item"

---

## Out of Scope for MVP

- Rich-text or Markdown editing for Description or Acceptance Criteria.
- File or image attachments.
- @-mention or autocomplete in any field.
- Autosave / draft persistence while the dialog is open.
- Field-level change history or diff view in edit mode.
