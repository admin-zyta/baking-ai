# DEPRECATED — Baking is global. Do not install per project.
# Only creates handoff/ if you need it. Config: ~/Desktop/side/baking/config.json

param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectPath
)

Write-Warning "enable-project.ps1 is DEPRECATED. Baking is global (~/Desktop/side/baking/config.json)."
Write-Warning "Use /baking or 'use baking'. Does not create .cursor/opus-sonnet.json."

$handoffDir = Join-Path $ProjectPath ".cursor\handoff"
New-Item -ItemType Directory -Force -Path $handoffDir | Out-Null
Write-Host "OK: $handoffDir (diary only — global config)"
