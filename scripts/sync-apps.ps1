param(
  [switch]$Update,
  [switch]$Local,
  [string]$RunId = "",
  [string]$Destination = "C:\Users\hasan\MyHabitMastery"
)

$ErrorActionPreference = "Stop"

$AppExtensions = @(".exe", ".msi", ".dmg", ".AppImage", ".deb", ".rpm", ".apk", ".ipa")

if (-not (Test-Path $Destination)) {
  New-Item -ItemType Directory -Path $Destination -Force | Out-Null
}

function Copy-BuiltBinaries {
  param([string]$SourceRoot)
  $copied = @()
  $files = Get-ChildItem -Path $SourceRoot -Recurse -File | Where-Object {
    $AppExtensions -contains $_.Extension
  }

  foreach ($file in $files) {
    $targetPath = Join-Path $Destination $file.Name
    Copy-Item -Path $file.FullName -Destination $targetPath -Force
    $sizeMB = [Math]::Round($file.Length / 1MB, 2)
    $copied += [PSCustomObject]@{
      File     = $file.Name
      Size     = "$sizeMB MB"
      Location = $targetPath
    }
  }
  return $copied
}

if ($Local) {
  Write-Host "`n[1/2] Building Windows Desktop App (Tauri)..." -ForegroundColor Cyan
  if (Get-Command cargo -ErrorAction SilentlyContinue) {
    npm run tauri:build
  } else {
    Write-Warning "Rust/Cargo not found locally. Skipping local Windows Tauri build (use 'npm run apps:update' to build via GitHub Actions)."
  }

  Write-Host "`n[2/2] Building Android APK (Capacitor)..." -ForegroundColor Cyan
  if (Get-Command java -ErrorAction SilentlyContinue) {
    npm run build:native
    npx cap sync android
    Push-Location android
    try {
      .\gradlew.bat assembleDebug
    } finally {
      Pop-Location
    }
    if (Test-Path "android\app\build\outputs\apk\debug\app-debug.apk") {
      Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" (Join-Path $Destination "MyHabitMastery-Android.apk") -Force
    }
  } else {
    Write-Warning "Java JDK not found locally. Skipping local Android build (use 'npm run apps:update' to build via GitHub Actions)."
  }

  $results = @()
  if (Test-Path "src-tauri\target\release\bundle") {
    $results += Copy-BuiltBinaries -SourceRoot "src-tauri\target\release\bundle"
  }
  $apkPath = Join-Path $Destination "MyHabitMastery-Android.apk"
  if (Test-Path $apkPath) {
    $apkItem = Get-Item $apkPath
    $results += [PSCustomObject]@{
      File     = $apkItem.Name
      Size     = "$([Math]::Round($apkItem.Length / 1MB, 2)) MB"
      Location = $apkItem.FullName
    }
  }

  Write-Host "`nCopied local builds to $Destination :" -ForegroundColor Green
  $results | Format-Table -AutoSize
  exit 0
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI ('gh') is required to pull all 5 platform builds. Install it with: winget install GitHub.cli && gh auth login"
  exit 1
}

if ($Update) {
  Write-Host "`nTriggering 5-platform build on GitHub Actions..." -ForegroundColor Cyan
  $prevRunId = gh run list --workflow=release-apps.yml --limit 1 --json databaseId --jq ".[0].databaseId"
  gh workflow run release-apps.yml

  $targetRunId = ""
  for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 3
    $candidate = gh run list --workflow=release-apps.yml --limit 1 --json databaseId --jq ".[0].databaseId"
    if ($candidate -and $candidate -ne $prevRunId) {
      $targetRunId = $candidate
      break
    }
  }

  if (-not $targetRunId) {
    $targetRunId = gh run list --workflow=release-apps.yml --limit 1 --json databaseId --jq ".[0].databaseId"
  }
  if (-not $targetRunId) {
    Write-Error "Could not find the triggered GitHub Actions workflow run."
    exit 1
  }

  Write-Host "Watching run #$targetRunId until all 5 platforms finish building..." -ForegroundColor Yellow
  gh run watch $targetRunId --exit-status
  $RunId = $targetRunId
}

if (-not $RunId) {
  $RunId = gh run list --workflow=release-apps.yml --status completed --limit 1 --json databaseId --jq ".[0].databaseId"
}

if (-not $RunId) {
  Write-Error "No completed 'release-apps.yml' runs found yet. Push your changes and run 'npm run apps:update'."
  exit 1
}

$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("mhm_apps_" + $RunId)
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "`nDownloading all 5 platform apps from GitHub Actions run #$RunId..." -ForegroundColor Cyan
gh run download $RunId --dir $tempDir

# Remove previous copied installers in destination before copying latest ones
Get-ChildItem -Path $Destination -File -ErrorAction SilentlyContinue | Where-Object {
  $AppExtensions -contains $_.Extension
} | Remove-Item -Force -ErrorAction SilentlyContinue

$copied = Copy-BuiltBinaries -SourceRoot $tempDir
Remove-Item $tempDir -Recurse -Force

if ($copied.Count -eq 0) {
  Write-Warning "No app binaries were found in run #$RunId."
} else {
  Write-Host "`nAll $($copied.Count) app files copied to $Destination :" -ForegroundColor Green
  $copied | Format-Table -AutoSize
}
