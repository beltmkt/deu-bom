# Edge Case Hunter Review Prompt - Voice Command Documentation

Use `bmad-review-edge-case-hunter`.

You may inspect the project read-only. Focus only on unhandled edge cases introduced by the current documentation package.

## Files To Review

- `_bmad-output/implementation-artifacts/spec-voice-command-documentation.md`
- `docs/bmad/voice-command-implementation-plan.md`
- `docs/bmad/voice-command-intent-contract.md`
- `docs/bmad/voice-command-test-matrix.md`
- `docs/bmad/README.md`
- `docs/bmad/work-log.md`
- Reference: `docs/bmad/voice-command-capability-map.md`

## Diff Scope

Baseline commit: `b3995682207f038765807dec3d4134bd0f06d485`

Changed/added files:

- Added `_bmad-output/implementation-artifacts/spec-voice-command-documentation.md`
- Added `docs/bmad/voice-command-implementation-plan.md`
- Added `docs/bmad/voice-command-intent-contract.md`
- Added `docs/bmad/voice-command-test-matrix.md`
- Modified `docs/bmad/README.md`
- Modified `docs/bmad/work-log.md`

## Review Focus

Check whether the docs miss edge cases around:

- destructive commands;
- recurring/parcelled finance scope;
- ambiguous entity resolution;
- permissions in shared workspaces;
- unsupported fields or future-only commands;
- localStorage vs Supabase boundaries;
- mobile navigation limitations for Metas and Analytics;
- import/export and data wipe safety;
- event item purchase status not existing in the database;
- parser compatibility with the existing MVP.

Return findings only. For each finding include severity, affected file, edge case, why it matters, and a concrete amendment.
