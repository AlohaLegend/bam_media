param(
  [Parameter(Mandatory = $true)]
  [string]$WorkerUrl
)

$ErrorActionPreference = "Stop"

$normalizedWorkerUrl = $WorkerUrl.Trim().TrimEnd("/")

if ($normalizedWorkerUrl -notmatch "^https://") {
  throw "WorkerUrl must start with https://"
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $repoRoot "admin\config.yml"
$adminPath = Join-Path $repoRoot "admin\index.html"

$config = Get-Content -Raw -LiteralPath $configPath

if ($config -match "(?m)^\s+base_url:") {
  $config = $config -replace "(?m)^(\s+)base_url:.*$", "`$1base_url: $normalizedWorkerUrl"
} else {
  $config = $config -replace "(?m)^(\s+)auth_methods: \[[^\]]+\]\s*$", "`$1auth_methods: [oauth]`r`n`$1base_url: $normalizedWorkerUrl"
}

$config = $config -replace "(?m)^(\s+)auth_methods: \[[^\]]+\]\s*$", "`$1auth_methods: [oauth]"
Set-Content -LiteralPath $configPath -Value $config -NoNewline

$admin = Get-Content -Raw -LiteralPath $adminPath
$admin = $admin -replace '<meta name="cms-auth-mode" content="[^"]*" />', '<meta name="cms-auth-mode" content="oauth" />'
Set-Content -LiteralPath $adminPath -Value $admin -NoNewline

Write-Host "CMS OAuth enabled with $normalizedWorkerUrl"
