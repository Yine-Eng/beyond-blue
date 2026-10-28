#!/usr/bin/env bash
# Creates labels, milestones and issues (and optionally a Projects board) for
# Beyond Blue from docs/roadmap.md, which is the single source of truth.
#
# Usage:
#   scripts/github-bootstrap.sh --dry-run          # parse and print, no GitHub calls
#   scripts/github-bootstrap.sh                    # labels + milestones + issues
#   scripts/github-bootstrap.sh --with-project     # also create the Projects board
#
# Safe to re-run: labels are upserted, and existing milestones and issues
# (matched by exact title) are skipped.
#
# Requirements: gh (authenticated as the repo owner), awk.
# --with-project needs the "project" scope: gh auth refresh -s project
# Set KEEP_WORK=1 to keep the parsed issue files for inspection.

set -euo pipefail

REPO="${REPO:-Yine-Eng/beyond-blue}"
OWNER="${REPO%%/*}"
PROJECT_TITLE="${PROJECT_TITLE:-Beyond Blue Roadmap}"
ROADMAP="${ROADMAP:-$(dirname "$0")/../docs/roadmap.md}"

DRY_RUN=false
WITH_PROJECT=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --with-project) WITH_PROJECT=true ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

log() { printf '%s\n' "$*"; }
run() {
  if $DRY_RUN; then log "  [dry-run] $*"; else "$@"; fi
}

[[ -f "$ROADMAP" ]] || { echo "Roadmap not found: $ROADMAP" >&2; exit 1; }

if ! $DRY_RUN; then
  command -v gh >/dev/null || { echo "gh CLI is required" >&2; exit 1; }
  gh auth status >/dev/null 2>&1 || { echo "Run 'gh auth login' first" >&2; exit 1; }
fi

# ---------------------------------------------------------------------------
# 1. Labels: name|color|description
# ---------------------------------------------------------------------------
LABELS=(
  "type:feature|1D76DB|New user-facing capability"
  "type:bug|D73A4A|Something is broken"
  "type:chore|C5DEF5|Tooling, config, maintenance"
  "type:docs|0075CA|Documentation"
  "type:test|BFD4F2|Tests and test infrastructure"
  "type:design|F4A9B8|Design system and visual work"
  "type:security|B60205|Security hardening"
  "area:infra|0B1F4D|Repo, CI, hosting, tooling"
  "area:design-system|F6C445|Tokens, components, UI kit"
  "area:landing|3E7BD9|Public story site"
  "area:auth|123C8C|Authentication and roles"
  "area:onboarding|A98BE0|Personalize flow"
  "area:plan|F26A2E|Plan screen, countdown, readiness areas"
  "area:tasks|F26A2E|Task completion and outputs"
  "area:profile|BFD7F5|Profile screen"
  "area:network|7FCB8A|Mentors, matching, connections"
  "area:pathways|A98BE0|Pathway switching"
  "area:detour|A98BE0|Detour Challenge"
  "area:launch-file|F6C445|Launch File and PDF export"
  "area:fund|7FCB8A|Last Mile Fund"
  "area:staff|0B1F4D|Staff dashboard and admin"
  "area:day-plus-100|3E7BD9|Day +100 survey and insights"
  "area:demo|F26A2E|Explore as Veronica demo mode"
  "area:pwa|BFD7F5|Installability and offline"
  "area:a11y|5319E7|Accessibility"
  "area:data|EADFC8|Schema, RLS, seed data"
  "priority:p0|B60205|Must ship for the milestone"
  "priority:p1|FBCA04|Should ship"
  "priority:p2|C2E0C6|Nice to have"
  "size:XS|EDEDED|Up to 1 hour"
  "size:S|D4D4D4|Up to 3 hours"
  "size:M|BABABA|Up to 1 day"
  "size:L|9E9E9E|Up to 2 days"
  "size:XL|7A7A7A|More than 2 days (split it)"
)

log "==> Labels (${#LABELS[@]})"
for entry in "${LABELS[@]}"; do
  IFS='|' read -r name color desc <<<"$entry"
  log "  $name"
  run gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" --force >/dev/null
done

# ---------------------------------------------------------------------------
# 2. Parse the roadmap into one file per issue and one per milestone.
#    Issue file: line 1 title, line 2 milestone, line 3 labels (comma list),
#    remaining lines body.
# ---------------------------------------------------------------------------
WORK="$(mktemp -d)"
trap '[[ -n "${KEEP_WORK:-}" ]] && echo "kept $WORK" || rm -rf "$WORK"' EXIT

tr -d '\r' <"$ROADMAP" | awk -v dir="$WORK" '
  /<!-- issues:start -->/ { on = 1; next }
  /<!-- issues:end -->/   { on = 0; next }
  !on { next }
  /^## / {
    if (file != "") close(file)
    inissue = 0
    milestone = substr($0, 4); m++
    mfile = sprintf("%s/milestone-%02d", dir, m)
    print milestone > mfile; close(mfile)
    next
  }
  /^> / && mfile != "" && !inissue {
    print substr($0, 3) >> mfile; close(mfile)
    next
  }
  /^#### / {
    if (file != "") close(file)
    n++; inissue = 1
    file = sprintf("%s/issue-%03d", dir, n)
    print substr($0, 6) > file
    print milestone >> file
    title = $0
    while ((getline labels) > 0 && labels ~ /^[[:space:]]*$/) {}
    if (labels !~ /^<!-- labels:/) { print "Missing labels line after: " title > "/dev/stderr"; exit 1 }
    sub(/^<!-- labels: */, "", labels); sub(/ *-->$/, "", labels)
    print labels >> file
    next
  }
  inissue { print >> file }
'

shopt -s nullglob
MILESTONE_FILES=("$WORK"/milestone-*)
ISSUE_FILES=("$WORK"/issue-*)
log "==> Parsed ${#MILESTONE_FILES[@]} milestones and ${#ISSUE_FILES[@]} issues from $ROADMAP"

# ---------------------------------------------------------------------------
# 3. Milestones
# ---------------------------------------------------------------------------
existing_milestones=""
if ! $DRY_RUN; then
  existing_milestones="$(gh api "repos/$REPO/milestones?state=all&per_page=100" --jq '.[].title')"
fi

log "==> Milestones"
for f in "${MILESTONE_FILES[@]}"; do
  title="$(sed -n '1p' "$f")"
  desc="$(sed -n '2p' "$f")"
  if grep -Fxq "$title" <<<"$existing_milestones"; then
    log "  = $title (exists)"
  else
    log "  + $title"
    run gh api "repos/$REPO/milestones" -f title="$title" -f description="$desc" >/dev/null
  fi
done

# ---------------------------------------------------------------------------
# 4. Issues (created in roadmap order so numbers follow the plan)
# ---------------------------------------------------------------------------
existing_issues=""
if ! $DRY_RUN; then
  existing_issues="$(gh issue list --repo "$REPO" --state all --limit 1000 --json title --jq '.[].title')"
fi

project_number=""
if $WITH_PROJECT; then
  log "==> Project board: $PROJECT_TITLE"
  if $DRY_RUN; then
    project_number="N"
  else
    project_number="$(gh project list --owner "$OWNER" --format json \
      --jq ".projects[] | select(.title == \"$PROJECT_TITLE\") | .number" | head -n1)"
    if [[ -z "$project_number" ]]; then
      project_number="$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json --jq '.number')"
      gh project link "$project_number" --owner "$OWNER" --repo "$REPO" >/dev/null || true
    fi
  fi
  log "  project #$project_number"
fi

log "==> Issues"
for f in "${ISSUE_FILES[@]}"; do
  title="$(sed -n '1p' "$f")"
  milestone="$(sed -n '2p' "$f")"
  labels="$(sed -n '3p' "$f" | tr -d ' ')"
  body_file="$f.body"
  tail -n +4 "$f" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}' >"$body_file"
  printf '\n---\n_Milestone: %s · Source: docs/roadmap.md_\n' "$milestone" >>"$body_file"

  if grep -Fxq "$title" <<<"$existing_issues"; then
    log "  = $title (exists)"
    continue
  fi

  label_args=()
  IFS=',' read -ra label_list <<<"$labels"
  for l in "${label_list[@]}"; do label_args+=(--label "$l"); done

  if $DRY_RUN; then
    log "  + [$milestone] $title  {$labels}"
    continue
  fi

  url="$(gh issue create --repo "$REPO" --title "$title" --body-file "$body_file" \
    --milestone "$milestone" "${label_args[@]}")"
  log "  + #${url##*/} $title"

  if [[ -n "$project_number" ]]; then
    gh project item-add "$project_number" --owner "$OWNER" --url "$url" >/dev/null
  fi
done

log "==> Done."
