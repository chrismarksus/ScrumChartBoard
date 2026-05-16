Release a new version of ScrumChartBoard to GitHub Pages.

Usage: /release <version>  (e.g. /release 0.3.0)

If no version is provided in $ARGUMENTS, ask the user for the version number before proceeding.

Follow these steps in order. Stop and report to the user if any step fails.

## Step 1 — Confirm version

The version argument is: $ARGUMENTS

If $ARGUMENTS is empty, ask: "What version number should I release? (e.g. 0.3.0)"

The version string to use is the raw number (e.g. `0.3.0`). The git tag will be `v0.3.0`.

Read `package.json` and show the user the current version. Confirm the new version with them before continuing.

## Step 2 — Pre-flight checks

Run lint and tests. Both must pass before touching any files:

```
npm run lint
npm test
```

If either fails, stop. Tell the user what failed and do not proceed.

## Step 3 — Bump version in package.json

Use `npm version <version> --no-git-tag-version` to update `package.json` (and `package-lock.json` if present) to the new version. Do not create a git tag here.

## Step 4 — Commit and push

Stage and commit only the version file(s):

```
git add package.json package-lock.json
git commit -m "chore: bump version to <version>"
git push origin master
```

## Step 5 — Create GitHub release

Ask the user: "Any release notes to include? (press Enter to skip)"

Then create the release:

```
gh release create v<version> \
  --repo chrismarksus/ScrumChartBoard \
  --title "v<version> · <one-line summary>" \
  --notes "<release notes or 'See commit history for changes.'>"
```

For the title subtitle, derive a short one-line summary from recent commits since the last tag (`git log <prev-tag>..HEAD --oneline`), or ask the user if it isn't obvious.

## Step 6 — Verify CI

After creating the release, run:

```
gh run list --repo chrismarksus/ScrumChartBoard --limit 3
```

Wait a moment and check that the deploy-pages workflow was triggered and shows `in_progress` or `completed`. If it shows `failure`, open the logs:

```
gh run view <run-id> --log-failed
```

Report the final deploy URL: `https://chrismarksus.github.io/ScrumChartBoard/`
