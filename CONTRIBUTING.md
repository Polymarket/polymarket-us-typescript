# Contributing

## Environment Setup

This project uses [`pnpm`](https://pnpm.io/) as its package manager.

```sh
pnpm install
pnpm build
```

## Development

```sh
# Build the SDK
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format
```

## Running Tests

```sh
pnpm test
```

Tests use Jest with mocked fetch calls. No API credentials are required for running tests.

## Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```sh
# Check for lint errors
pnpm lint

# Fix lint errors and format
pnpm lint:fix
```

## Making Changes

1. Create a new branch for your changes
2. Make your changes
3. Run `pnpm test` and `pnpm lint` to ensure everything passes
4. Submit a pull request

## Publishing

Releases are automated via GitHub Actions. When a PR is merged to `main`, the CI will automatically publish to npm based on conventional commit messages:

- `feat!:` or `BREAKING CHANGE` → major version bump
- `feat:` → minor version bump
- All other commits → patch version bump
