# Kuma Superpowers Engineering Workflow

> **Collaboration Guide for Developers & AI Agents**  
> We use a **Linear-First, Test-Driven Development (TDD)** execution loop to build Kuma with zero merge conflicts, zero context loss, and verified delivery.

```
Linear (Claim Issue) ➔ Spec Contract ➔ Test First (TDD) ➔ Implement & Verify ➔ Linear (Done + Evidence)
```

---

## 🔁 The 5-Step Superpowers Loop

### 1. Claim on Linear
* Open the active Milestone on [Linear](https://linear.app/elliot14a/project/kuma-熊-a544711b4a04).
* Assign the issue to yourself (or agent) and move the status to **`In Progress`**.
* *Purpose*: Prevents teammates from building the same feature simultaneously.

### 2. Contract First (`SPEC.md`)
* Reference [`SPEC.md`](./SPEC.md) for data schemas, Effect v4 interfaces, database tables, and API routes.
* *Rule*: Never invent ad-hoc types or raw inline styles. Consume shared models from `@kuma/domain` and styling variables from `@kuma/web/styles`.

### 3. Test First (TDD)
* Write unit or integration tests before writing implementation code:
  * Backend & Domain: `*.test.ts` files using `bun test` or Effect test runner.
  * API endpoints: Integration tests asserting response codes and DB state.
* Run `bun test` — **the test must fail initially** to confirm the requirement.

### 4. Implement & Verify
* Implement the minimal, clean code required to make tests pass.
* Run full project verification:
  ```bash
  just check     # TypeScript typecheck across all 4 packages
  just lint      # Biome linter and formatter validation
  bun test       # All unit and integration test suites
  ```
* All checks must be **100% green**.

### 5. Post Evidence on Linear & Close
* Make an atomic git commit:
  ```bash
  git commit -m "feat(domain): define assessment schema and validation tests (ELL-1)"
  ```
* Post a verification comment on the Linear issue detailing:
  * Files changed
  * Tests added / updated
  * Verification output summary
* Move the Linear issue to **`Done`**.

---

## 🛡️ Monorepo Stream Division

To avoid code collisions when working in parallel:

* **Backend & Engine Stream**: `packages/domain`, `packages/infra`, `apps/server`
* **Frontend Arena Stream**: `apps/web`

---

## 📌 Engineering Invariants

1. **Zero Slop Comments**: Code and configuration files must be self-documenting. No conversational docstrings or decorative comment headers.
2. **Environment Variable Prefix**: All env vars must strictly use the `KUMA_` prefix (e.g., `KUMA_DATABASE_URL`, `KUMA_NEBIUS_API_KEY`).
3. **Zero Raw Hex / Inline CSS**: All web styling must consume `@vanilla-extract/css` variables from `apps/web/src/styles/tokens.ts`.
