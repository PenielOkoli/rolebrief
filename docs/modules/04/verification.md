# Verification — RoleBrief, deliverable 4

Date: 10 November 2026 (Africa/Lagos).

## Observed checks

- TypeScript and the initial 20 automated rendering/boundary tests passed. Two additional tests cover constrained source quotes and sanitized provider error codes; final results are recorded below when complete.
- Local production build passed. Dedicated Vercel production builds also reached Ready.
- The live studio and `/schema` returned HTTP 200. Invalid requests and malformed JSON returned 400, unsupported media 415, oversized bodies 413, and foreign origins 403.
- Browser interaction verified the checklist count, JSON inspector, restore example, and all nine invalid/edge-case lab scenarios. Invalid sections were withheld and export was disabled; invalid envelopes showed full recovery. HTML-like content appeared literally.
- Mobile inspection at a 390 × 844 viewport showed a 375px content width and a matching document scroll width (no horizontal overflow).
- Before provider configuration, analyzing showed the configuration fallback while preserving the labeled example.

## Provider verification history

The first live check passed en-GB but returned 422 for en-NG. This failure is preserved in `first-live-verification.json`. Later checks encountered a provider HTTP 400 classified as `AI_APICallError` and a semantic validation rejection. No provider output was substituted with a sample.

The provider contract now restricts source quotes to exact, bounded excerpts from the submitted description. A structured-output or semantic validation failure gets at most one regeneration, within a shared request deadline. All regenerated output must pass the same checks. Final live results are in `live-verification.json`.

## Reproduce

```sh
npm run check
node --import tsx scripts/verify-deployment.tsx https://rolebrief-beta.vercel.app --live
```

The deployment verifier writes actual results, fails unless both locales render valid real provider output with `--live`, and never substitutes fixtures.

## Deployment and scope

- Dedicated repository: https://github.com/PenielOkoli/rolebrief
- Dedicated live app: https://rolebrief-beta.vercel.app
- Vercel project `rolebrief` was connected successfully to this repository using `vercel git connect`.
- The user configured the new sensitive Production key. Credentials were not printed or committed.
- Browser screenshots and final automatic-deployment evidence are added after the last verification pass.

This new product follows the user's explicit direction. It does not claim Module 1 product continuity. Checklist state is page-session only. English Nigeria/UK are regional variants, not translations. Evidence is self-confirmed; exact quotes and schema checks do not prove every interpretation correct.
