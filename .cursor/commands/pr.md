# pr

## Goal

Create a PR following best practices:

- Ensure working tree is clean (stage + commit if needed)
- Push branch to origin
- Open a PR via GitHub CLI with a detailed, structured description

---

## 1) Preconditions

- You are on the correct feature branch (NOT main/master).
- Your changes compile/tests pass (if applicable).
- You have `gh` installed and authenticated:
  - `gh auth status`

---

## 2) Steps

### Step A — Verify branch and status

```bash
git status
git branch --show-current

If you’re on main or master, create/switch to a feature branch:

git checkout -b feature/<short-name>
Step B — If there are unstaged changes, stage them

Check status:

git status

Stage selectively (recommended):

git add -p

Or stage all (only if you’re sure):

git add .

Re-check:

git status
Step C — If there are no commits yet for these changes, commit them

If git status shows “Changes to be committed”, commit:

git commit -m "feat: <short summary>" -m "<why + what changed + impact>"

Commit message rules

Use conventional commits if possible: feat:, fix:, refactor:, chore:, docs:, test:

Keep the first line short, descriptive.

Step D — Sync with remote and push branch

Fetch latest:

git fetch origin

Push branch (set upstream if first push):

git push -u origin HEAD

Step E — Create PR with GitHub CLI (detailed description)

Use a structured PR body. You can either type in editor or pass --body.

Option 1: Open editor (recommended)

gh pr create --base main --head "$(git branch --show-current)" --title "feat: <title>" --body-file -

Then paste this template:

## Summary
- What does this PR change?

## Why
- Why is this change needed? Link to issue/ticket if exists.

## Changes
- Bullet list of main code changes (files/modules/components)
- API/DB changes (if any)
- UI/UX changes (if any)


## How to Test
1. Step-by-step instructions
2. Expected result

## Risks / Notes
- Edge cases
- Migration/rollback notes (if any)
- Potential impacts

## Checklist
- [ ] I ran tests / build (or explain why not)
- [ ] No hardcoded values added
- [ ] Functions/components are documented
- [ ] Reusable components/utilities used where applicable

Option 2: Provide body inline

gh pr create \
  --base main \
  --head "$(git branch --show-current)" \
  --title "feat: <title>" \
  --body "## Summary
- ...

## Why
- ...

## Changes
- ...

## How to Test
1. ...
2. ...

## Risks / Notes
- ...

## Checklist
- [ ] Tests/build ran
- [ ] No hardcodes
- [ ] Documented functions/components
"
3) After PR is created

Copy PR URL

Assign reviewers (if your repo uses it):

gh pr edit --add-reviewer <githubUser1>,<githubUser2>

Add labels (optional):

gh pr edit --add-label "feature"

View PR:

gh pr view --web

4) Safety checks (must do)

Ensure git status is clean before PR:

git status

Ensure you didn’t commit secrets:

Check .env is ignored

Review diff:

git diff origin/main...HEAD


This command will be available in chat with /pr
```
