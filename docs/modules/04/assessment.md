# Structured Outputs and AI-Driven UI Rendering

Phase 2 · Week 5 · Deliverable 4

| Requirement | Evidence |
|---|---|
| Defined output schema | `src/lib/schema.ts`; generated JSON Schema at `/schema` |
| Typed UI components | `src/components/brief-view.tsx`, inferred Zod types |
| Missing, invalid, partial, unexpected data | `decodeBrief` validates envelope and complete sections independently |
| Visible fallback states | Section recovery panels and full-response recovery; interactive validation lab |
| Separate narrative and machine data | `overview.narrative` versus `requirements`, `evidence`, `tasks`; independent metadata |
| Rendering edge-case tests | `tests/rendering.test.tsx`: actual React server rendering and boundary tests |
| Locale-ready design | Separate `locale`, matching request/response checks, Intl number formatting for en-NG/en-GB |
| Model integration | Server-only Groq; AI SDK structured output with Zod; no free-text parsing |
| Honest source grounding | Every requirement quote must be an exact substring of the supplied listing; evidence references verified |

## Reviewer walkthrough

1. Initial output is explicitly labeled **Example brief** and uses a fictional job listing.
2. Expand a requirement's source quote. Tick an evidence checkbox to confirm your own evidence.
3. Open **Validation lab** and choose **Missing requirements**. Requirements and dependent evidence are withheld; preparation tasks remain.
4. Try **Incomplete task**, **Empty evidence**, **Duplicate IDs**, and **Unverified quote**. Inspect field diagnostics and the disabled Export control.
5. Choose **Unexpected field**, **Wrong locale**, or **Truncated JSON** for full recovery.
6. Choose **HTML-like text**. It renders literally, never as executable markup.
7. Restore the example, inspect JSON, and export the validated brief.
8. Open the schema page to inspect the strict generated contract.
9. If live analysis is configured, analyze the example and verify **AI-generated brief** with **Structure verified**.

## Limitations

Regional English variants demonstrate locale metadata, not multilingual translation. Structural validation and exact quotes do not establish the accuracy of every interpretation. Applicant evidence is self-confirmed and not independently verified. Nothing is submitted to employers. State is not persisted across reloads. Rate limiting is per server instance, not distributed. This is a new product at the user's explicit direction, rather than continuation of Module 1.
