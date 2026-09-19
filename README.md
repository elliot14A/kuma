# 🐻 Kuma (熊)

> **Autonomous AI engineering assessment platform that benchmarks real-world coding, debugging, and system problem-solving**  
> Built for the **Nebius x NVIDIA Global AI Hackathon** (Coding & Agentic Engineering Track).

---

## 💡 Overview

**Kuma (熊)** is an autonomous technical assessment platform designed for real-world software engineering:

1. **Grounded Multi-File Challenges**: Synthesizes realistic multi-file repository challenges (TypeScript + Python) using Nebius LLMs, with automated pre-flight sandbox validation.
2. **Deterministic Isolated Execution**: Dual-engine runner (Docker container execution in development, Nebius code execution sandboxes in production) enforcing strict CPU, memory, and timeout bounds.
3. **Zero-Auth Candidate Arena**: Shareable magic links opening a lightweight Preact + Monaco editor workspace with live ANSI streaming logs and test case assertion breakdowns.
4. **Forensic Telemetry & Bounded Copilot**: In-editor AI copilot with token quotas, alongside telemetry capturing keystroke bursts, copy-paste anomalies, and focus loss.
5. **Manager Evaluation**: Clean submission review with test correctness, code quality metrics, and candidate AI copilot prompt transcripts.

---

## 🛠️ Tech Stack

- **Runtime & Backend**: [Effect v4](https://effect.website) (`4.0.0-rc.115`), `@effect/platform`, `@effect/sql-pg`, PostgreSQL, Bun
- **Frontend**: Preact, Monaco Editor, Vanilla Extract (`.css.ts`), `ansi-to-react`
- **Execution Engine**: Docker (local dev) / Nebius Code Execution Sandboxes (production)
- **AI & Grounding**: Nebius AI Studio (`nvidia/Llama-3.1-Nemotron-70B-Instruct`), Tavily Search API
- **Tooling**: Biome, Vitest, Just

---

## 📂 Monorepo Structure

```
kuma/
├── apps/
│   ├── server/               # Effect HTTP API, live SSE stream hub, Nebius AI orchestrator
│   └── web/                  # Preact candidate arena & lightweight manager UI
│
├── packages/
│   ├── domain/               # Effect v4 branded schemas, error hierarchy, wire contracts
│   └── infra/                # PostgreSQL repositories, Docker sandbox runner, Nebius client
│
├── docs/                     # Architecture, Effect v4 guide, coding standards, plans
├── Justfile                  # Workspace commands
└── biome.json                # Formatting and linting configuration
```

---

## 🚀 Quickstart

### Prerequisites
- [Bun](https://bun.sh) (v1.2+)
- [Docker](https://www.docker.com/) & Docker Compose
- [Just](https://github.com/casey/just)

### Setup & Run
```bash
# 1. Install dependencies
bun install

# 2. Start PostgreSQL
just db-up

# 3. Typecheck and lint
just check
just lint

# 4. Start development servers
just dev
```

---

## 📚 Documentation

- [Architecture & System Design](docs/ARCHITECTURE.md)
- [Coding Standards & Co-Location](docs/CODING_STANDARDS.md)
- [Effect v4 Guide](docs/EFFECT_GUIDE.md)
- [Workflow & TDD Guidelines](WORKFLOW.md)
- [Milestone 1 Implementation Plan](docs/superpowers/plans/2026-09-16-milestone-1-candidate-workspace-and-domain-schemas.md)

---

## 📄 License

[MIT](LICENSE)
