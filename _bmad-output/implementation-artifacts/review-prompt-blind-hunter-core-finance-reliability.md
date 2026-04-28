---
title: 'Review prompt - Blind hunter - Core finance reliability'
created: '2026-04-27'
review_role: 'blind_hunter'
skill: 'bmad-review-adversarial-general'
---

# Blind Hunter Review Prompt

You are using the `bmad-review-adversarial-general` skill.

Review only the diff for the current uncommitted work. Do not read the PRD, spec, docs, repository files, conversation, or project context. Treat the diff as the entire input.

In the repository root, ask the runner to provide this content as your only review material:

```powershell
git diff 51e5f880b0e121ea2dee506d45e18439217391fa -- . ':!.vercel' ':!dist'
git ls-files --others --exclude-standard
```

Focus on bugs, regressions, misleading behavior, data integrity risks, and missing tests implied by the diff. Produce a Markdown list of findings only.
