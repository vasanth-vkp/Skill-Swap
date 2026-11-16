# SkillSwap Maven PowerShell Wrapper (PowerShell 5.1 & Core compatible)
$ErrorActionPreference = 'Stop'

$cmd = Get-Command mvn -ErrorAction SilentlyContinue
if ($cmd) {
    $mvnPath = $cmd.Source
} else {
    $fallback = "C:\Users\senth\.m2\wrapper\dists\apache-maven-3.9.6\0f95e7798d182e3371f3fee6d8202d3a56e6d71dfd3a2402139882ef2fbe7476\bin\mvn.cmd"
    if (Test-Path $fallback) {
        $mvnPath = $fallback
    } else {
        Write-Error "Maven could not be found. Please ensure Maven is installed."
        exit 1
    }
}

# Fix PowerShell splitting -Dproperty.name arguments at dots
$cleanedArgs = [System.Collections.Generic.List[string]]::new()
foreach ($arg in $args) {
    if ($arg.StartsWith('.') -and $cleanedArgs.Count -gt 0 -and $cleanedArgs[$cleanedArgs.Count - 1].StartsWith('-D')) {
        $cleanedArgs[$cleanedArgs.Count - 1] = $cleanedArgs[$cleanedArgs.Count - 1] + $arg
    } else {
        $cleanedArgs.Add($arg)
    }
}

& $mvnPath $cleanedArgs
exit $LASTEXITCODE
