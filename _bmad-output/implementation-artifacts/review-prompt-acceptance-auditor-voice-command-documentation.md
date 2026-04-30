# Acceptance Auditor Review Prompt - Voice Command Documentation

Use an acceptance-auditor stance. You may inspect the project read-only.

## Required Inputs

Read:

- `_bmad-output/implementation-artifacts/spec-voice-command-documentation.md`
- `_bmad-output/project-context.md`
- `docs/bmad/current-state.md`
- `docs/bmad/voice-command-capability-map.md`
- `docs/bmad/voice-command-implementation-plan.md`
- `docs/bmad/voice-command-intent-contract.md`
- `docs/bmad/voice-command-test-matrix.md`
- `docs/bmad/README.md`
- `docs/bmad/work-log.md`

## Diff Scope

Baseline commit: `b3995682207f038765807dec3d4134bd0f06d485`

Changed/added files:

- Added `_bmad-output/implementation-artifacts/spec-voice-command-documentation.md`
- Added `docs/bmad/voice-command-implementation-plan.md`
- Added `docs/bmad/voice-command-intent-contract.md`
- Added `docs/bmad/voice-command-test-matrix.md`
- Modified `docs/bmad/README.md`
- Modified `docs/bmad/work-log.md`

## Acceptance Criteria To Audit

- Given a dev opens `docs/bmad/README.md`, when looking for voice command work, then links exist to the operational map, implementation plan, intent contract, and test matrix.
- Given an agent will implement voice in Finance or Shopping, when reading the plan, then it sees which files to touch first and which commands are out of the first batch.
- Given a destructive or ambiguous command appears in the matrix, when criteria are read, then there is visual confirmation, candidate choice, or request for more detail before execution.
- Given a recurring transaction will be changed by voice, when docs describe the flow, then `single/future/all` is required before calling the store.
- Given a module does not have full technical support, when it appears in docs, then it is marked as dependency/future rather than ready behavior.

## Rules To Audit

- Do not modify frozen intent.
- Do not invent behavior unsupported by current code or database.
- Do not edit generated Supabase files.
- Maintain pt-BR and ASCII style.
- Keep each new document distinct rather than duplicating the capability map.

Return findings only. Classify each as `intent_gap`, `bad_spec`, `patch`, `defer`, or `reject`, and explain why.
