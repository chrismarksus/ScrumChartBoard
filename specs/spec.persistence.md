# Persistence

## Overview

All user data is persisted to `localStorage` for the MVP. The persistence layer must be abstracted behind a module so a backend API can be swapped in later without changing page logic.

---

## Abstraction

All reads and writes go through a single `Storage` module. No page or component accesses `localStorage` directly. The module exposes a small interface (see below); all other pages depend only on that interface, not on the underlying mechanism.

---

## localStorage Schema

### Keys

| Key | Contents |
|---|---|
| `scrumboard.items` | JSON array of all work item objects |
| `scrumboard.next_id` | JSON integer — the next ID to assign at creation |

Both keys are written together whenever items change. `scrumboard.next_id` only increases; it is never reset or reused even if items are deleted.

### Work Item Object Shape

```json
{
  "id": 1,
  "title": "As a user I can log in",
  "state": "Ready",
  "effort": 3,
  "interval": "Sprint 4",
  "assignedTo": "Jane Smith",
  "tags": "frontend, auth",
  "description": "...",
  "acceptanceCriteria": "...",
  "createdAt": "2026-05-18T14:32:00.000Z",
  "modifiedAt": "2026-05-18T15:10:00.000Z"
}
```

- `effort` is stored as a number; `null` means unestimated.
- `interval`, `assignedTo`, `tags`, `description`, and `acceptanceCriteria` are stored as strings; empty string means blank.
- Timestamps are ISO 8601 strings.

---

## Storage Module Interface

The module must support at minimum:

| Method | Description |
|---|---|
| `getItems()` | Returns the full array of work items, or `[]` if none stored. |
| `saveItems(items)` | Writes the full items array to storage. |
| `nextId()` | Returns the next available integer ID and increments the counter. |

Pages call `getItems()` on load and `saveItems()` after any mutation. `nextId()` is called once at item creation.

---

## Error Handling

- If `localStorage` is unavailable (e.g. private browsing with storage blocked), the app should degrade gracefully: load with empty data and suppress write errors silently. No error UI is required for MVP.
- Corrupt or unparseable data in a key is treated as empty (same as missing).

---

## Future / Out of Scope for MVP

- Backend API swap — the `Storage` module interface is the seam where this happens. A future `ApiStorage` implementation would replace `LocalStorage` behind the same interface.
- Multi-device sync, conflict resolution, or offline queuing.
- Separate storage namespaces per team or project.
