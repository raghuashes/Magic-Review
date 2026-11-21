param (
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    [string]$RepoUrl = "https://github.com/raghuashes/Magic-Review",
    [string]$Branch = "main"
)

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

Write-Host "Connecting to Render API to automate Magic Review deployment..." -ForegroundColor Cyan

# 1. Fetch Owner / User ID
try {
    $owners = Invoke-RestMethod -Uri "https://api.render.com/v1/owners" -Method Get -Headers $headers
    $ownerId = $owners[0].owner.id
    Write-Host "Authenticated as owner: $($owners[0].owner.email) (ID: $ownerId)" -ForegroundColor Green
} catch {
    Write-Host "Failed to authenticate with Render API. Please check your API key." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# 2. Deploy Blueprint
$body = @{
    name = "magic-review"
    repo = $RepoUrl
    branch = $Branch
    ownerId = $ownerId
    autoDeploy = "yes"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "https://api.render.com/v1/blueprints" -Method Post -Headers $headers -Body $body
    Write-Host "`nBlueprint Deployment successfully triggered!" -ForegroundColor Green
    Write-Host "Blueprint ID: $($res.id)"
    Write-Host "Status: $($res.status)"
    Write-Host "View your live deployment status in Render Dashboard: https://dashboard.render.com" -ForegroundColor Cyan
} catch {
    Write-Host "Error triggering blueprint deployment: $($_.Exception.Message)" -ForegroundColor Red
}
