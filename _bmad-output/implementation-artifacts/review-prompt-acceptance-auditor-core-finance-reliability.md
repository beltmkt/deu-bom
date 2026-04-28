---
title: 'Review prompt - Acceptance auditor - Core finance reliability'
created: '2026-04-27'
review_role: 'acceptance_auditor'
---

# Acceptance Auditor Review Prompt

Review whether the current uncommitted implementation satisfies the approved spec and context docs. Do not use conversation context.

Read these files:

- `_bmad-output/implementation-artifacts/spec-core-finance-reliability-qa.md`
- `_bmad-output/project-context.md`
- `_bmad-output/planning-artifacts/prd.md`

Inspect the current changes from baseline:

```powershell
git diff 51e5f880b0e121ea2dee506d45e18439217391fa -- . ':!.vercel' ':!dist'
git ls-files --others --exclude-standard
```

Check for violations of acceptance criteria, frozen intent, boundaries, PRD rules, and project context. Classify each finding as one of: `intent_gap`, `bad_spec`, `patch`, `defer`, or `reject`. Return findings as a concise Markdown list with file references when possible.
