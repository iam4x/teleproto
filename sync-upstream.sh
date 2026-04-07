#!/bin/bash

set -euo pipefail

UPSTREAM_NAME="upstream"
UPSTREAM_URL="https://github.com/sanyok12345/teleproto.git"
UPSTREAM_BRANCH="main"
TARGET_BRANCH="main"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_error() {
  echo -e "${RED}Error:${NC} $1" >&2
}

print_info() {
  echo -e "${YELLOW}$1${NC}"
}

print_success() {
  echo -e "${GREEN}$1${NC}"
}

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  print_error "This script must be run from inside a git repository."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  print_error "You have uncommitted changes. Commit or stash them before syncing."
  exit 1
fi

if ! git show-ref --verify --quiet "refs/heads/${TARGET_BRANCH}"; then
  print_error "Local branch '${TARGET_BRANCH}' does not exist."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"

if [[ "${CURRENT_BRANCH}" != "${TARGET_BRANCH}" ]]; then
  print_info "Checking out '${TARGET_BRANCH}'..."
  git checkout "${TARGET_BRANCH}"
fi

if git remote get-url "${UPSTREAM_NAME}" >/dev/null 2>&1; then
  CURRENT_UPSTREAM_URL="$(git remote get-url "${UPSTREAM_NAME}")"

  if [[ "${CURRENT_UPSTREAM_URL}" != "${UPSTREAM_URL}" ]]; then
    print_error "Remote '${UPSTREAM_NAME}' points to '${CURRENT_UPSTREAM_URL}', expected '${UPSTREAM_URL}'."
    print_error "Update it manually if you want to use this sync script."
    exit 1
  fi
else
  print_info "Adding '${UPSTREAM_NAME}' remote..."
  git remote add "${UPSTREAM_NAME}" "${UPSTREAM_URL}"
fi

print_info "Fetching ${UPSTREAM_NAME}/${UPSTREAM_BRANCH}..."
git fetch "${UPSTREAM_NAME}" "${UPSTREAM_BRANCH}"

print_info "Rebasing '${TARGET_BRANCH}' onto '${UPSTREAM_NAME}/${UPSTREAM_BRANCH}'..."

set +e
git rebase "${UPSTREAM_NAME}/${UPSTREAM_BRANCH}"
REBASE_EXIT_CODE=$?
set -e

if [[ ${REBASE_EXIT_CODE} -ne 0 ]]; then
  echo
  print_error "Rebase stopped because of conflicts."
  echo "Resolve the conflicts, then run:"
  echo "  git status"
  echo "  git add <resolved-files>"
  echo "  git rebase --continue"
  echo
  echo "To cancel the rebase:"
  echo "  git rebase --abort"
  exit "${REBASE_EXIT_CODE}"
fi

print_success "Local '${TARGET_BRANCH}' is now rebased onto '${UPSTREAM_NAME}/${UPSTREAM_BRANCH}'."
echo "Review the result and push manually when ready:"
echo "  git push --force-with-lease origin ${TARGET_BRANCH}"
