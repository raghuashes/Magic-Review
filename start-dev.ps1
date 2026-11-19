$backendProc = Start-Process -FilePath "C:\Program Files\Java\jdk-21.0.10\bin\java.exe" `
    -ArgumentList "-Dspring.profiles.active=local", "-jar", "target\magic-review-backend-1.0.0.jar" `
    -WorkingDirectory "C:\magic revieew\backend" `
    -RedirectStandardOutput "C:\magic revieew\backend\backend.log" `
    -RedirectStandardError "C:\magic revieew\backend\backend-error.log" `
    -PassThru

Write-Host "Started Backend PID $($backendProc.Id) on http://localhost:8080"

try {
    npm run dev --prefix frontend
} finally {
    if ($backendProc -and -not $backendProc.HasExited) {
        Write-Host "Stopping backend PID $($backendProc.Id)..."
        Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
    }
}
