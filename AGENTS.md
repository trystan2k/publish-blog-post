# AGENTS.md

## Project Overview

**publish-blog-post** is a GitHub Action that automates publishing markdown blog posts to Dev.to (and Medium - planned). It processes markdown files with front matter, publishes/updates posts via platform APIs, and commits changes back to the repository.

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.9
- **Package Manager**: pnpm (enforced via preinstall script)
- **Testing**: Vitest with 80% coverage threshold
- **Linting**: ESLint + Prettier
- **Build**: @vercel/ncc (compiles to single `dist/index.js`)

## Key Dependencies

- `@actions/core`, `@actions/exec`, `@actions/github` - GitHub Actions SDK
- `ky` - HTTP client for API calls
- `gray-matter` - Parse markdown front matter
- `find` - File system utilities

## Project Structure

```
src/
├── index.ts          # Main entry point
├── git/              # Git operations (checkout, commit, push)
├── hosting/          # Platform APIs (devto.ts, types.ts)
├── posts/            # Post processing (content.ts, process.ts)
└── utils/            # Utilities (const.ts, file.ts, logger.ts, matter.ts)

test/                 # Mirror of src structure with .test.ts files
```

## Important Commands

```bash
# Build (compiles to dist/index.js for distribution)
pnpm build

# Run checks (typecheck + lint + test:all + build)
pnpm complete-check

# Run tests
pnpm test              # Changed files only
pnpm test:all          # All tests

# Lint and typecheck
pnpm lint
pnpm typecheck
```

**Always run `pnpm complete-check` after making changes.**

## Path Alias

- `@/pbp/*` maps to `src/*`

## Testing

- Framework: Vitest
- Environment: node
- Coverage thresholds: 80% (statements, branches, functions, lines)
- Config: `vitest.config.ts`

## Action Inputs (action.yml)

- `token` - GitHub token (default: github.token)
- `publishTo` - Platforms to publish (default: 'devTo')
- `devToApiKey` - API key for Dev.to
- `includeFolders` - Folders to scan for posts
- `commitMessage` - Template for commit messages

## Key Conventions

1. **Git**: Uses GitHub Actions toolkit for git operations
2. **Error Handling**: Uses `setBuildFailed` from @actions/core for action failures
3. **Logging**: Use `logBuildInfo` utility for consistent output
4. **Matter Format**: Posts use YAML front matter (title, description, tags, id for updates)
5. **Build Output**: Must commit `dist/index.js` after building (single compiled file)

## Commit Message Format

Uses Conventional Commits enforced via commitlint:

- Format: `<type>(<scope>): <subject>`
- Types: feat, fix, docs, style, refactor, test, chore
- Use `pnpm cz` for interactive commit helper
