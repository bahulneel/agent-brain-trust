---
description: Cut a git-flow release from develop, infer the semver bump from commits since the last version tag, bump workspace versions, finish the release, push branches and tags, and publish a GitHub release. Use when shipping a new project release.
disable-model-invocation: true
---

# Relase

## Workflow

1. Verify the repo is on `develop` and the worktree is clean. Stop if there are uncommitted changes, missing `git flow`, or missing `gh`.
2. Find the latest semver tag with `git tag --sort=version:refname`. Use the highest tag that looks like `0.4.0` or `v0.4.0`.
3. Inspect commits since that tag with `git log <last-tag>..HEAD --pretty=format:%s%n%b%x00`.
4. Select the version bump from those commits:
   - `major` if any commit subject contains `!:` or any body contains `BREAKING CHANGE`
   - `minor` if any commit subject starts with `feat`
   - `patch` otherwise
5. Read the current version from the root `package.json`, compute the next semver version, and keep the repo's plain numeric tag style unless the latest tag clearly establishes a different convention.
6. Start the release with `git flow release start <next-version>`.
7. Bump versions with `npm version <next-version> --no-git-tag-version --workspaces --include-workspace-root`.
8. Stage the version files and commit them with `chore: update package versions to <next-version> across all modules`.
9. Finish the release with `git flow release finish -m <next-version> <next-version>`.
10. Push the main branch, develop branch, and tags to `origin`. If `git flow release finish` already pushed them, verify that state instead of duplicating unnecessary pushes.
11. Create the GitHub release with `gh release create <next-version> --verify-tag --generate-notes --latest --title <next-version>`.
12. Report the last tag inspected, the chosen bump, the new version, and the GitHub release URL.

## Notes

- For a preview-only request, gather the last tag, commit range, and computed next version, then stop before `git flow release start`.
- Stop on any dirty worktree, branch mismatch, or missing `git flow` / `gh`.
- Do not force-push or bypass failures.
