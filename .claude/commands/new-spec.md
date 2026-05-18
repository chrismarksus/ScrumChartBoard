Create a new spec file for the page or feature named: $ARGUMENTS

Steps:
1. Normalize the name: lowercase with underscores for the filename (e.g. "Sprint Board" → `spec.sprint_board.md`), title case for the document heading.
2. Create the file at `specs/spec.{name}.md` using the template below.
3. Add the new spec to the "Planned Future Tabs" table in `specs/spec.main_tabbar.md` if it corresponds to a tab (board, planner, project, teams). If it doesn't map to a tab, skip this step.
4. Report the file path created and any cross-reference updates made.

---

Use this template (fill in the name; leave section bodies as stubs for the user to complete):

```markdown
# {Title}

## Overview

TODO

---

## Navigation

Accessed by clicking the {Title} tab in the main tab bar (see `spec.main_tabbar.md`).

---

## Layout

TODO

---

## Behavior

TODO

---

## Out of Scope for MVP

TODO
```
