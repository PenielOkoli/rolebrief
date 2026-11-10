# RoleBrief

**Make your next move count.** A fresh job application workspace for FlexiSAF deliverable 4: Structured Outputs and AI-Driven UI Rendering, Phase 2, Week 5.

Paste a job description to get source-backed requirement cards, a checklist for evidence you actually have, and practical preparation tasks. The AI never supplies an applicant's claimed experience or sends applications.

## Submission evidence

- Repository: https://github.com/PenielOkoli/rolebrief
- Live app: https://rolebrief-beta.vercel.app
- [Assessment mapping and walkthrough](docs/modules/04/assessment.md)
- [Implementation plan](docs/modules/04/plan.md)
- [Verification evidence](docs/modules/04/verification.md)
- [Output schema](src/lib/schema.ts)
- [Typed rendering components](src/components/brief-view.tsx)
- [Rendering and boundary tests](tests/rendering.test.tsx)

Verified: TypeScript, 22 automated tests, production build, browser recovery/checklist/export interactions, mobile layout, and real Groq output in en-NG and en-GB. The repository is connected to its own Vercel project and automatic deployment has succeeded. See the evidence for the earlier provider failures and the strict validation/retry handling added in response.

## Run

Use Node.js 22.x. Run `npm ci`, `npm run dev`, and `npm run check` (TypeScript, tests, production build). Set `GROQ_API_KEY` on the server to enable live analysis; without it the labeled example and validation lab remain available. Never commit secrets or put them in a `NEXT_PUBLIC_` variable.

The dedicated Vercel project is connected to this GitHub repository for automatic deployment. The user configured its sensitive Production `GROQ_API_KEY` variable. Optional `GROQ_MODEL` defaults to `openai/gpt-oss-20b`. Live verification results are recorded separately, rather than inferred from configuration.

## Validation architecture

`unknown → strict envelope → section schemas → unique IDs / source quotes / references → typed components`

The server requests structured data through AI SDK `Output.object`, validates it again, and returns only fully valid results. Its request-specific schema constrains quotes to verbatim excerpts of the submitted description. A structured-output or semantic validation failure gets one bounded regeneration using safe feedback; a second failure returns a visible error while preserving the prior brief. The browser independently validates responses. The lab exercises the same decoder with deliberately invalid fixtures, including section-level recovery. Export requires a fully valid response and includes provenance and applicant-confirmed evidence IDs.

## Provenance and scope

The user explicitly chose a new product and design on 10 November 2026. Application code and UI are newly written for RoleBrief. Dependency versions and basic TypeScript/security configuration were reused from local ShelfSignal commit `473ef0d`; no product UI, catalog, deployment identity, secrets, or Git history was copied. The generic bounded JSON-reader approach was adapted and expanded for job descriptions.

The curriculum asks for continuity with Module 1. This new product follows the user's explicit override and must not be represented as satisfying that continuity requirement. Previously submitted repositories and deployments remain unchanged.

English Nigeria/UK demonstrate regional formatting, not two translated languages. Checklist progress lasts for the page session. Exact quotes help source inspection but do not prove every AI interpretation. There is no fit score, employment decision, application submission, database, or distributed quota.
