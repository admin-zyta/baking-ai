# Deploy Baking globally from versioned repo (~/Desktop/side/baking)
# Source: global/cursor → ~/.cursor  |  global/claude → ~/.claude

$ErrorActionPreference = "Stop"
$repo = if ($env:BAKING_HOME) { $env:BAKING_HOME } else { Join-Path $env:USERPROFILE "Desktop\side\baking" }
$version = Get-Content (Join-Path $repo "VERSION") -Raw
$version = $version.Trim()

$cursorSrc = Join-Path $repo "global\cursor"
$claudeSrc = Join-Path $repo "global\claude"

function Deploy-Tree($src, $dstRoot) {
    if (-not (Test-Path $src)) { throw "Missing: $src" }
    Get-ChildItem $src -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($src.Length).TrimStart('\')
        $dest = Join-Path $dstRoot $rel
        $dir = Split-Path $dest -Parent
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Copy-Item -Force $_.FullName $dest
        Write-Host "  $rel"
    }
}

Write-Host "Baking $version — sync global"
Write-Host ""
Write-Host "Cursor (~/.cursor):"
Deploy-Tree $cursorSrc (Join-Path $env:USERPROFILE ".cursor")

Write-Host ""
Write-Host "Claude Code (~/.claude):"
Deploy-Tree $claudeSrc (Join-Path $env:USERPROFILE ".claude")

Write-Host ""
Write-Host "OK: Baking $version deployed"
Write-Host "Config: $repo\config.json"
