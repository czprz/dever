function Find-Drives {
    return (Get-CimInstance -Class Win32_LogicalDisk | where{$_.DriveType -eq '3'}).DeviceID
}

function Find-GitRepositories {
    Param
    (
         [string] $Drive,
         [string[]] $Directories
    )

    $Directories | ForEach-Object { Get-ChildItem -Path "$Drive\$_" -Include "dever.json" -ErrorAction SilentlyContinue -Recurse | % { Write-Host $_.FullName } }
}

function Get-OnlyValidFolders {
    Param
    (
         [string] $Drive
    )

    $excluded = @('windows', 'program files', 'program files (x86)')

    return Get-ChildItem -Path $Drive\ -Directory -Name -Exclude $excluded
}

Find-Drives | ForEach-Object {
    $validFolders = Get-OnlyValidFolders -Drive $_
    Find-GitRepositories -Drive $_ -Directories $validFolders;
}