#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

changed_files="$(
  {
    git diff --name-only --relative HEAD
    git ls-files --others --exclude-standard
  } | sort -u
)"

if [ -z "$changed_files" ]; then
  echo "No worktree changes detected. Skipping secret guard."
  exit 0
fi

failures=""

while IFS= read -r file_path; do
  [ -n "$file_path" ] || continue
  [ -e "$file_path" ] || continue

  case "$file_path" in
    .env|.env.*)
      case "$file_path" in
        *.example|*.sample|*.template)
          ;;
        *)
          failures="${failures}\n- blocked env file: ${file_path}"
          ;;
      esac
      ;;
    *.pem|*.p12|*.pfx|*.key|*.tfstate|*.tfstate.backup)
      failures="${failures}\n- blocked sensitive file type: ${file_path}"
      ;;
  esac

  if ! grep -Iq . "$file_path"; then
    continue
  fi

  if grep -En 'BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}' "$file_path" >/dev/null; then
    failures="${failures}\n- possible secret content: ${file_path}"
  fi
done <<EOF
$changed_files
EOF

if [ -n "$failures" ]; then
  echo "Secret guard blocked the current worktree changes:" >&2
  printf '%b\n' "$failures" >&2
  exit 1
fi

echo "Secret guard passed."
