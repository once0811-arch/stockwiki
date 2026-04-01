#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"
pnpm_cmd=(corepack pnpm)

changed_files="$(
  {
    git diff --name-only --relative HEAD
    git ls-files --others --exclude-standard
  } | sort -u
)"

if [ -z "$changed_files" ]; then
  echo "No worktree changes detected. Skipping post-edit checks."
  exit 0
fi

echo "Running post-edit checks from $repo_root"

package_dirs="$(
  printf '%s\n' "$changed_files" \
    | awk -F/ '($1=="apps" || $1=="packages" || $1=="services") && $2 != "" { print $1 "/" $2 }' \
    | sort -u
)"

if [ -n "$package_dirs" ]; then
  printf '%s\n' "$package_dirs" | while IFS= read -r package_dir; do
    [ -n "$package_dir" ] || continue
    [ -f "$package_dir/package.json" ] || continue

    package_name="$(node -e "process.stdout.write(require('./${package_dir}/package.json').name)")"
    echo "-> corepack pnpm --filter $package_name lint"
    "${pnpm_cmd[@]}" --filter "$package_name" lint
  done
else
  echo "No workspace package changes detected."
fi

if printf '%s\n' "$changed_files" | grep -Eq '\.md$'; then
  echo "-> corepack pnpm lint:docs"
  "${pnpm_cmd[@]}" lint:docs
  echo "-> corepack pnpm validate:docs"
  "${pnpm_cmd[@]}" validate:docs
fi

schema_like_files="$(printf '%s\n' "$changed_files" | grep -E '(^|/)(schema|api|dto)(/|$)' || true)"
if [ -n "$schema_like_files" ]; then
  echo "Schema/API/DTO changes detected. Running package-scoped typecheck." >&2

  printf '%s\n' "$schema_like_files" \
    | awk -F/ '($1=="apps" || $1=="packages" || $1=="services") && $2 != "" { print $1 "/" $2 }' \
    | sort -u \
    | while IFS= read -r package_dir; do
        [ -n "$package_dir" ] || continue
        [ -f "$package_dir/package.json" ] || continue

        package_name="$(node -e "process.stdout.write(require('./${package_dir}/package.json').name)")"
        echo "-> corepack pnpm --filter $package_name typecheck"
        "${pnpm_cmd[@]}" --filter "$package_name" typecheck
      done

  echo "OpenAPI/type generation validation is still deferred. See docs/progress/debt-ledger.md." >&2
fi

if printf '%s\n' "$changed_files" | grep -Eq '(^|/)(migrations?|db/migrate)(/|$)'; then
  echo "Migration-like changes detected. Review migration safety manually before commit." >&2
fi
