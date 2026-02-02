param (
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,
    [Parameter(Mandatory = $true)]
    [string]$DestinationPath
)

try {
    $SourcePath = Resolve-Path $SourcePath
    
    Write-Host "Iniciando Word para Reconstrucción Total..."
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    
    Write-Host "Abriendo documento original: $SourcePath"
    $sourceDoc = $word.Documents.Open($SourcePath.Path)
    
    # Seleccionar todo el contenido
    $sourceDoc.Content.Select()
    $word.Selection.Copy()
    
    Write-Host "Creando documento NUEVO (Vacío)..."
    $newDoc = $word.Documents.Add()
    
    # Pegar como texto o con formato pero en documento nuevo
    # Usamos Paste para mantener tablas si existen, pero en un container nuevo
    $word.Selection.Paste()
    
    Write-Host "Purgando encabezados y pies de página (Eliminando firmas)..."
    foreach ($section in $newDoc.Sections) {
        foreach ($header in $section.Headers) {
            $header.Range.Delete()
        }
        foreach ($footer in $section.Footers) {
            $footer.Range.Delete()
        }
    }
    
    Write-Host "Eliminando metadatos del nuevo documento..."
    $newDoc.RemoveDocumentInformation(99)
    $newDoc.Saved = $false
    
    # Limpiar propiedades de autor explícitamente
    $newDoc.BuiltInDocumentProperties("Author").Value = "Juan Pablo"
    $newDoc.BuiltInDocumentProperties("Company").Value = "Rojo AI Orchestrator"
    
    Write-Host "Guardando RECONSTRUCCIÓN en: $DestinationPath"
    $newDoc.SaveAs([ref]$DestinationPath)
    
    $sourceDoc.Close($false)
    $newDoc.Close()
    $word.Quit()
    
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($sourceDoc) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($newDoc) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    
    Write-Host "SUCCESS: El documento ha sido RECONSTRUIDO desde cero en $DestinationPath"
}
catch {
    Write-Error "ERROR REVOLUCIONARIO: $_"
    if ($word) { $word.Quit() }
    exit 1
}
