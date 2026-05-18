Read every file in the `specs/` directory. Then check for the following problems and report them grouped by category:

**1. Broken cross-references**
Find every `spec.*.md` filename mentioned in any spec file. Verify each one exists in the `specs/` directory. Report any that don't.

**2. Orphaned specs**
List any spec files in `specs/` that are never referenced by any other spec.

**3. Mentioned-but-undefined behaviors**
Look for language like "keyboard shortcut", "hotkey", "shortcut key", or similar — then check whether the shortcut is actually defined nearby. Flag any that are mentioned without a definition.

**4. Missing standard sections**
Every spec should have at minimum: an **Overview** section and an **Out of scope for MVP** section (or equivalent). Flag any spec missing either.

**5. Contradictions across specs**
Look for the same behavior described differently in two specs (e.g. a field described as required in one place and optional in another, or a button described as always-enabled in one spec and conditionally-enabled in another).

Output a clean report. For each issue, cite the file name and the specific line or quote involved. If no issues are found in a category, say "None found." End with a one-line summary of total issues found.
