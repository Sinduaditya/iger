# Exclude node_modules, .git, bin, etc.
Get-ChildItem -Recurse -Directory | 
Where-Object { $_.FullName -notlike '*\node_modules*' } | 
Tree /A /F | Out-File -FilePath .\project_structure.txt

Write-Host "Struktur folder (tanpa node_modules) disimpan di: project_structure.txt"