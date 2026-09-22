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

Releases are published by GitHub Actions from the version in `package.json`.
Include the intended semantic version bump in the pull request so it is reviewed
with the release. After merge, the workflow publishes that exact version if it
is not already on npm. Commit messages do not change the package version.
