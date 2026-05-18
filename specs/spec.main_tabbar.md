# Main Tab Bar

## Overview

The main tab bar is a persistent navigation bar at the top of the application. It is always visible regardless of which page is active. Tabs are added to the bar only when their corresponding page has been built — no placeholder or disabled tabs for unbuilt pages.

---

## MVP Tabs

For the MVP, two tabs exist:

| Order | Label | Page |
|---|---|---|
| 1 | Backlog | `spec.backlog.md` |
| 2 | Dashboard | Existing Scrum charts page |

---

## Planned Future Tabs

The following pages are planned but not yet built. Each requires its own spec before implementation. They are **not** added to the tab bar until the page exists.

| Label | Notes |
|---|---|
| Board | Kanban-style board view of work items |
| Planner | Sprint planning interface |
| Project | Timeline / Gantt view (maps to existing Timelines chart data) |
| Teams | Team member management (enables Assigned To dropdown — see `spec.work_item.md`) |

When a new page is built and its spec is complete, add its tab to the bar in the order listed above (i.e. Board comes after Backlog, Planner after Board, etc.).

---

## Default Landing Tab

The active tab on initial load is determined by whether the Dashboard can load data. The Dashboard requires `?team=` and `?project=` query params to fetch its JSON files — without them, it cannot render anything useful.

- **`?team=` and `?project=` are both present in the URL** → open on **Dashboard**.
- **Either param is missing** → open on **Backlog**.

This check happens once at app startup. After that, tab state follows user navigation.

Note: the presence of localStorage work items is not used for this check — a user with items but no URL params still lands on Backlog, since Dashboard would be empty.

---

## Active Tab Behavior

- The currently active tab is visually highlighted (distinct from inactive tabs).
- Clicking the already-active tab does nothing.
- Clicking an inactive tab navigates to that page and updates the active highlight.
- The URL should reflect the active tab (e.g. `?tab=backlog`) so the page can be bookmarked or shared. On load, if a `?tab=` param is present it takes precedence over the default landing logic.
- `?tab=` coexists with other query params (`?team=`, `?project=`). Example: `?team=abc&project=sample&tab=backlog`. Tab navigation must preserve all existing params and update only `?tab=`.

---

## Branding

TBD at design time — whether to include an app name or logo to the left of the tabs is a visual design decision not yet specified.

---

## Out of Scope for MVP

- Keyboard navigation between tabs (e.g. arrow keys).
- Tab reordering by dragging.
- Hiding or showing tabs based on user role or permissions.
- Notification badges or counts on tabs.
- More than two tabs visible simultaneously.

---

## Specs Needed (one per future tab)

- `spec.board.md`
- `spec.planner.md`
- `spec.project.md`
- `spec.teams.md`
