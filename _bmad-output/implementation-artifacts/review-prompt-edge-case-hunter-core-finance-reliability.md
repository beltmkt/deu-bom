---
title: 'Review prompt - Edge case hunter - Core finance reliability'
created: '2026-04-27'
review_role: 'edge_case_hunter'
skill: 'bmad-review-edge-case-hunter'
---

# Edge Case Hunter Review Prompt

You are using the `bmad-review-edge-case-hunter` skill.

Review the current uncommitted diff and project files only as needed to resolve referenced functions. Do not use conversation context.

In the repository root, inspect:

```powershell
git diff 51e5f880b0e121ea2dee506d45e18439217391fa -- . ':!.vercel' ':!dist'
git ls-files --others --exclude-standard
```

Return only a valid JSON array of directly reachable, unhandled edge cases in the changed code. Use the exact output schema required by `bmad-review-edge-case-hunter`.
