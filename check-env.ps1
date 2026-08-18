$required = @(
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY"
)

$envFile = ".env"

if (-not (Test-Path $envFile)) {
  Write-Host "ERROR: .env file is missing"
  exit 1
}

$missing = @()

foreach ($name in $required) {
  $line = Get-Content $envFile | Where-Object { $_ -match "^$name=" }

  if (-not $line) {
    $missing += $name
  }
}

if ($missing.Count -gt 0) {
  Write-Host "ERROR: Missing environment variables:"
  $missing | ForEach-Object { Write-Host " - $_" }
  exit 1
}

Write-Host "SUCCESS: Athletic IQ environment is ready"
