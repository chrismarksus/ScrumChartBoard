# Confirm Delete Dialog

## Overview

A modal confirmation dialog shown any time a destructive delete action is triggered anywhere in the app. The user must explicitly confirm before the delete proceeds. This dialog is app-wide — all delete actions route through it.

---

## Triggering

The dialog is shown before any delete executes. It is never skipped, regardless of how many items are selected or how the delete was triggered (toolbar button, keyboard shortcut, etc.).

---

## Dialog Content

### Message text

| Selection | Message |
|---|---|
| 1 item | "Delete 1 work item?" |
| 2+ items | "Delete 3 work items?" *(count substituted)* |

The item type label ("work item") should be passed in by the caller so the dialog can be reused across different contexts as new pages are added (e.g. "Delete 1 team member?").

### Buttons

| Button | Action |
|---|---|
| **Cancel** | Closes the dialog. No items are deleted. |
| **Confirm** | Closes the dialog and executes the delete. |

The **Confirm** button should be visually styled as a destructive/danger action (e.g. red).

---

## Behavior

- The dialog is modal — the rest of the app is blocked while it is open.
- Pressing **Escape** is equivalent to clicking **Cancel**.
- Focus is placed on the **Cancel** button when the dialog opens, so the default keyboard action (Enter or Space) is the safe choice.
- After **Confirm**: items are deleted, the dialog closes, and the list updates. If the deleted item(s) were selected, the selection is cleared and the detail panel shows the empty state.
- After **Cancel**: the dialog closes, selection state is unchanged, no data is modified.

---

## Out of Scope for MVP

- Undo / undo toast after deletion.
- Showing item titles or details in the dialog body.
