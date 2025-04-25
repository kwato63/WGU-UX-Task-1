
$commitMessage = Read-Host "Enter your Git commit message"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Continuation of work"
}

git add *
git commit -m "$commitMessage"
git push
