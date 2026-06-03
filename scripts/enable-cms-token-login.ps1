$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $repoRoot "admin\config.yml"
$adminPath = Join-Path $repoRoot "admin\index.html"

$config = Get-Content -Raw -LiteralPath $configPath
$config = $config -replace "(?m)^(\s+)auth_methods: \[[^\]]+\]\s*$", "`$1auth_methods: [token]"
$config = $config -replace "(?m)^\s+base_url:.*\r?\n?", ""
Set-Content -LiteralPath $configPath -Value $config -NoNewline

$admin = Get-Content -Raw -LiteralPath $adminPath
$admin = $admin -replace '<meta name="cms-auth-mode" content="[^"]*" />', '<meta name="cms-auth-mode" content="token" />'
Set-Content -LiteralPath $adminPath -Value $admin -NoNewline

Write-Host "CMS token login enabled"
