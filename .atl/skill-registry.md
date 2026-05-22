# Skill Registry

Generated: 2026-05-21
Project: wilrop

This registry is an index of available runtime skills. It is not a summary. Agents must read the referenced `SKILL.md` source before using a skill.

## Scan Scope

- Project skill directories checked: `skills/`, `.opencode/skills/`, `.claude/skills/`, `.gemini/skills/`, `.cursor/skills/`, `.github/skills/`, `.codex/skills/`, `.qwen/skills/`, `.kiro/skills/`, `.openclaw/skills/`, `.pi/skills/`, `.agent/skills/`, `.agents/skills/`, `.atl/skills/`.
- User skill directories checked: `~/.pi/agent/skills/`, `~/.config/agents/skills/`, `~/.agents/skills/`, `~/.kimi/skills/`, `~/.config/opencode/skills/`, `~/.config/kilo/skills/`, `~/.claude/skills/`, `~/.gemini/skills/`, `~/.gemini/antigravity/skills/`, `~/.cursor/skills/`, `~/.copilot/skills/`, `~/.codex/skills/`, `~/.codeium/windsurf/skills/`, `~/.qwen/skills/`, `~/.kiro/skills/`, and `~/.openclaw/skills/`.
- Excluded by SDD init rule: `sdd-*`, `_shared`, and `skill-registry`.
- Duplicate skills found under `~/.gemini/skills/` and `~/.copilot/skills/`; selected `~/.config/opencode/skills/` entries by scan order because no project-level skills were found.

## Skills

| Skill | Scope | Trigger | Source |
| --- | --- | --- | --- |
| `branch-pr` | user | Create Gentle AI pull requests with issue-first checks. Trigger: creating, opening, or preparing PRs for review. | `C:\Users\jhony\.config\opencode\skills\branch-pr\SKILL.md` |
| `chained-pr` | user | Trigger: PRs over 400 lines, stacked PRs, review slices. Split oversized changes into chained PRs that protect review focus. | `C:\Users\jhony\.config\opencode\skills\chained-pr\SKILL.md` |
| `cognitive-doc-design` | user | Design docs that reduce cognitive load. Trigger: writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs. | `C:\Users\jhony\.config\opencode\skills\cognitive-doc-design\SKILL.md` |
| `comment-writer` | user | Write warm, direct collaboration comments. Trigger: PR feedback, issue replies, reviews, Slack messages, or GitHub comments. | `C:\Users\jhony\.config\opencode\skills\comment-writer\SKILL.md` |
| `go-testing` | user | Trigger: Go tests, go test coverage, Bubbletea teatest, golden files. Apply focused Go testing patterns. | `C:\Users\jhony\.config\opencode\skills\go-testing\SKILL.md` |
| `issue-creation` | user | Create Gentle AI issues with issue-first checks. Trigger: creating GitHub issues, bug reports, or feature requests. | `C:\Users\jhony\.config\opencode\skills\issue-creation\SKILL.md` |
| `judgment-day` | user | Trigger: judgment day, dual review, adversarial review, juzgar. Run blind dual review, fix confirmed issues, then re-judge. | `C:\Users\jhony\.config\opencode\skills\judgment-day\SKILL.md` |
| `skill-creator` | user | Trigger: new skills, agent instructions, documenting AI usage patterns. Create LLM-first skills with valid frontmatter. | `C:\Users\jhony\.config\opencode\skills\skill-creator\SKILL.md` |
| `skill-improver` | user | Trigger: improve skills, audit skills, refactor skills, skill quality. Audit and upgrade existing LLM-first skills. | `C:\Users\jhony\.config\opencode\skills\skill-improver\SKILL.md` |
| `work-unit-commits` | user | Plan commits as reviewable work units. Trigger: implementation, commit splitting, chained PRs, or keeping tests and docs with code. | `C:\Users\jhony\.config\opencode\skills\work-unit-commits\SKILL.md` |

## Project Convention Files

| File | Notes |
| --- | --- |
| `AGENTS.md` | Present but empty. No referenced convention files found in it. |
