$ErrorActionPreference='Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try { npx --yes --package=tailwindcss@3.4.17 tailwindcss -i css/tailwind.input.css -c tailwind.config.cjs -o css/tailwind.css --minify; if($LASTEXITCODE -ne 0){throw 'Tailwind build failed'} } finally { Pop-Location }
