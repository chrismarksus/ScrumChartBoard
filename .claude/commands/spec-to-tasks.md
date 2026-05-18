Generate a concrete implementation task list from a spec file and file it as a GitHub enhancement issue.

The spec file to use is: $ARGUMENTS

---

## Step 1 — Read the spec

Read `specs/$ARGUMENTS`. Also read any other spec files it cross-references, so you have full context on shared behaviors (dialogs, persistence, etc.).

## Step 2 — Produce the task list

Break the spec into concrete, implementation-level tasks. Organize them into these groups (omit any group that has no tasks):

**New files** — source files that need to be created (components, modules, classes). One task per file. Include the expected path under `app/scripts/`.

**Modified files** — existing source files that need changes (e.g. `Scrum.js` to wire in a new tab, `main.js` for routing). One task per file, with a short note on what changes.

**Behaviors** — discrete pieces of UI or logic to implement (selection, drag-to-reorder, validation, etc.). One task per behavior.

**Persistence** — any localStorage reads/writes needed, keyed to `spec.persistence.md`'s interface.

**Tests** — one task per meaningful unit of testable logic (following the project's Mocha + jsdom pattern in `test/`).

Write each task as a GitHub-flavored markdown checkbox: `- [ ] task description`

Keep tasks concrete and small enough that each one could be a single commit. Do not add tasks for things not covered by the spec.

## Step 3 — File the GitHub issue

Run the following, substituting the spec title and task list:

```
gh issue create \
  --title "Implement: {spec title}" \
  --label "enhancement" \
  --body "$(cat <<'EOF'
## Spec
`specs/$ARGUMENTS`

## Tasks

{task list from Step 2}

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

If the `enhancement` label doesn't exist in the repo, create it first with `gh label create enhancement --color 84b6eb`.

## Step 4 — Report

Print the GitHub issue URL and a summary of how many tasks were created in each group.
