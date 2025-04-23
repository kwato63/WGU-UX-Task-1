# pushAllChanges.ps1

# Prompt the user for a commit message
$commitMessage = Read-Host "Enter your Git commit message"

# Run the Git commands
git add *
git commit -m "$commitMessage"
git push