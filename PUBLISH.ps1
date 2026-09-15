$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
gh auth status
if ($LASTEXITCODE -ne 0) { throw 'Run gh auth login first, then rerun this script.' }
$profileLogin = gh api user --jq '.login'
if ($LASTEXITCODE -ne 0 -or $profileLogin.Trim() -ne 'rockstar5656') { throw 'Authenticate as rockstar5656 before publishing.' }
if (-not (Test-Path -LiteralPath '.git')) {
    git init -b main
    if ($LASTEXITCODE -ne 0) { throw 'Git initialization failed.' }
}
git add README.md assets notebook scripts data .github .gitignore SETUP.md PUBLISH.ps1
git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    git -c user.name='Vidit Shah' -c user.email='136052363+rockstar5656@users.noreply.github.com' commit -m 'Build source-linked engineering profile and public inventory automation'
    if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
}
$ErrorActionPreference = 'Continue'
gh repo view rockstar5656/rockstar5656 --json name 2>$null
$profileRepoExists = $LASTEXITCODE -eq 0
$ErrorActionPreference = 'Stop'
if ($profileRepoExists) { throw 'Profile repository already exists. Preserve its contents and integrate this package through a branch instead.' }
gh repo create rockstar5656/rockstar5656 --public --description 'Engineering notebook: source, architecture, decisions, and verification.' --source . --remote origin --push
if ($LASTEXITCODE -ne 0) { throw 'Repository creation or push failed. Inspect GitHub before retrying.' }
Write-Host 'Published: https://github.com/rockstar5656'
