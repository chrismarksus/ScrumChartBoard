#!/usr/bin/env node
// .claude/spec-change-hook.js
// PostToolUse hook for .claude/settings.json.
// If an Edit/Write targets a file under specs/spec.*.md, emit a
// systemMessage recommending /spec-lint.
//
// Uses synchronous stdin read for maximum compatibility with hook runners.

import fs from 'fs';

try {
  // Support two modes:
  // 1. Normal hook use: JSON payload via stdin (from settings.json)
  // 2. Manual test: node .claude/spec-change-hook.js path/to/spec.foo.md
  let filePath = '';

  if (process.argv.length > 2) {
    // CLI mode for easy testing
    filePath = process.argv[2];
  } else {
    // Hook mode: synchronous stdin
    const input = fs.readFileSync(0, 'utf8');
    const payload = JSON.parse(input.trim() || '{}');
    filePath =
      (payload.tool_input && payload.tool_input.file_path) ||
      payload.file_path ||
      '';
  }

  // Works for both / and \ separators, case-insensitive
  const isSpecFile = /specs[\/\\]spec\./i.test(filePath);

  if (isSpecFile) {
    console.log(
      JSON.stringify({
        systemMessage:
          'Spec file changed — consider running /spec-lint to check for inconsistencies.'
      })
    );
  }
  // Silent otherwise (no output = no message injected)
} catch (err) {
  // Hooks must never break the user's workflow.
  // Swallow errors (equivalent to the original || true).
}
