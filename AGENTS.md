# Developer Guidelines - Midnight Academy

- **Framework**: TanStack Start with React 19 & TypeScript.
- **Styling**: Tailwind CSS with consistent color palette and semantic tokens.
- **Routing**: File-based routes located inside `src/routes/`.
- **Database & Auth**: Supabase integration configured under `src/integrations/supabase/`.

## 🔒 Mandatory Production Readiness & Functional Definition of Done (P0 Rule)

1. **Definition of Done**: NEVER consider a feature implemented, complete, working, functional, or production-ready merely because a route renders, a component exists, TypeScript compiles, a test is mocked, a build succeeds, or an API returns a response.
2. **End-to-End Invariant**: A feature is COMPLETE ONLY when:
   - The actual student/admin end-to-end workflow works against real persisted application state in PostgreSQL / Supabase.
   - The UI interaction is fully functional and reactive.
   - Server-side validation, ownership, and authorization are strictly enforced.
   - Failure, timeout, and edge cases are gracefully handled without application crash.
   - An automated regression test proves the exact behavior.
3. **Zero-Fake-Data / No Silent Fallback Policy**:
   - NEVER satisfy missing functionality with placeholder controls, fake/mock success states, hardcoded scores, static analytics, synthetic production fallback data, fake recordings, fake evaluations, dummy audio, fabricated content, or disconnected pages.
   - NEVER silently degrade a production assessment into a fallback blueprint. Missing production data must fail closed with an explicit error.
   - NEVER claim TOEFL / TestGlider capability parity without actually testing the corresponding workflow end-to-end.
4. **Fix, Don't Document Around Broken Code**: Whenever an implementation is incomplete or broken, fix the underlying architecture immediately instead of masking it. Functional correctness, data integrity, security, real user behavior, and regression coverage are the ONLY definition of DONE.

