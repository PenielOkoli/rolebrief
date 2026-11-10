# RoleBrief — deliverable 4 plan

The user selected a fresh job application workspace on 10 November 2026. Build a new product and visual identity, a new GitHub repository, and a separate GitHub-connected Vercel project. Preserve all ShelfSignal repositories and deployments.

## Acceptance criteria

- A strict Zod contract separates locale/version metadata, narrative overview, and typed requirements/evidence/tasks.
- Treat all provider and network data as unknown until validated.
- Render requirement cards, an applicant-controlled evidence checklist, and a preparation table.
- Withhold invalid sections and their dependants. Reject invalid envelopes. Disable export unless fully valid.
- Validate exact source quotes and evidence references; do not fabricate applicant experience or compute suitability scores.
- Include interactive failure scenarios and actual React rendering tests.
- Verify desktop/mobile interactions, API boundaries, production build, deployment and live generation where configured.

## Product and design

RoleBrief turns a pasted job description into an honest preparation workspace. Ink-blue navigation, a violet action palette, compact document panels, and a numbered workflow distinguish it from ShelfSignal. No applications are sent; checklist state is session-only.

## Curriculum exception

The supplied brief says to continue the Module 1 product. The user explicitly requested a new idea and chose this product instead. RoleBrief meets the structured-output learning outcomes but must not be described as continuing the Module 1 product.
