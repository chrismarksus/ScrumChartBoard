Start a unit of work by finding or creating a GitHub issue to track it.

Usage: /start-work <short description>  (e.g. /start-work add dark mode to landing page)

The description is: $ARGUMENTS

If $ARGUMENTS is empty, ask: "What are you working on?"

## Step 1 — Search for an existing issue

Run:
```
gh issue list --repo chrismarksus/ScrumChartBoard --state open --limit 50
```

Scan the results for any issue that matches the intent described in $ARGUMENTS. Show the user any close matches and ask: "Does one of these cover what you're working on? (Enter a number to use it, or press Enter to create a new one)"

## Step 2 — Use existing or create new

**If the user picks an existing issue:** Note the issue number. Skip to Step 3.

**If no match / user wants a new issue:**

Draft a title and body from $ARGUMENTS, then confirm with the user before creating:
- Title: concise, imperative (e.g. "Add dark mode to landing page")
- Body: one or two sentences describing the goal and any relevant context

Create it:
```
gh issue create \
  --repo chrismarksus/ScrumChartBoard \
  --title "<title>" \
  --body "<body>"
```

Note the issue number from the output.

## Step 3 — Report and remind

Print a clear summary:

```
Issue: #<number> — <title>
URL:   <url>

Reference this issue in your commit messages:
  closes #<number>

After pushing, close the issue:
  gh issue close <number> --repo chrismarksus/ScrumChartBoard
```

That's it — do not start implementing anything. The user will take it from here.
