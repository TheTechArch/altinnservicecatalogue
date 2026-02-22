# AI Agent — Architecture Overview

This document provides concise architecture information for the AI agent that interacts with this repository. It is intended for reviewers, maintainers, and automation that need to understand how the agent fits into the project.

## Purpose and Goals
- Describe the responsibilities and boundaries of the AI agent.
- Show the main components and data flows.
- Provide deployment, security, and observability guidance.

## High-level Overview
The AI agent acts as an assistant/automation actor that can: analyze repository source code, propose or apply code changes (via PRs), run checks, and integrate with CI/CD and external services (e.g., model APIs, cloud resources).

Key responsibilities:
- Read repository content and metadata (files, projects, solution).
- Produce code changes as pull requests or commits.
- Suggest architectural or implementation improvements.
- Respect repository security policies and data-handling rules.

## Core Components
- Agent Core: orchestrates tasks, decision making, and access to repository content.
- Parser/Indexer: reads and indexes project structure (`.sln`, `*.csproj`, source files) for quick lookups.
- Code Transform/Editor: applies safe, minimal edits and runs build/checks.
- Integrations: GitHub (PRs, issues), CI (workflow triggers), cloud providers (optional).
- Model Interface: abstraction over LLMs or other model providers — responsible for prompt management, rate-limiting, and caching.

## Data Flow
1. Trigger (manual, scheduled, webhook) starts a task.
2. Agent reads repository files through the GitHub API or local checkout.
3. Parser builds a context snapshot (files, projects, dependencies).
4. Model Interface is called with the snapshot and a concise instruction.
5. The agent validates the model response, applies edits, runs build/tests, and creates a PR with explanation.

## Security & Privacy
- Do not send secrets or private files to external models. Use explicit allow-lists for files that can be shared.
- Authenticate agent using short-lived tokens and least privilege GitHub App credentials.
- Log only metadata; avoid storing source file contents in logs.

## CI / Deployment
- Deploy as a GitHub App or GitHub Action for repository-scoped operations.
- Use environment isolation for any code execution and run `dotnet build` / `dotnet test` in containers.
- Ensure CI runs before merging agent-created PRs.

## Observability
- Emit structured events for: task start/complete, PR created, errors, and build/test results.
- Attach diagnostics (build logs, test summaries) to PRs.

## Extensibility
- Keep `Model Interface` abstract to switch providers.
- Add new analyzers as pluggable modules.

## Minimal checklist for PRs created by the agent
- [ ] Build succeeds (locally/CI)
- [ ] Tests pass (unit/integration where available)
- [ ] Description includes rationale and risk notes
- [ ] No secrets were added or exposed

## Relevant paths and files
- `/.github` — actions and agent metadata
- Solution files and projects — used by the parser to build context

If you want the agent to perform a specific task (e.g., add architecture diagrams, open a PR with changes), list the desired changes and any files that may contain sensitive data to exclude.