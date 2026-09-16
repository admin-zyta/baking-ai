# DEPRECATED — Baking is global. Do not install per project.
# Config: ~/Desktop/side/baking/config.json
# Skills: install-claude-skills.ps1

param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectPath,
    [switch]$UserAgents,
    [switch]$MergeClaudeMd
)

Write-Warning "enable-project.ps1 (claude-code) is DEPRECATED. Baking is global."
Write-Warning "Use /baking. Profile claude: edit profile in ~/Desktop/side/baking/config.json"

$handoffDir = Join-Path $ProjectPath ".cursor\handoff"
New-Item -ItemType Directory -Force -Path $handoffDir | Out-Null
Write-Host "OK: $handoffDir (diary only)"

if ($UserAgents) {
    & (Join-Path $env:USERPROFILE "Desktop\side\baking\claude-code\install-claude-skills.ps1")
}

Write-Host ""
Write-Host "/baking  —  no per-repo init needed"
