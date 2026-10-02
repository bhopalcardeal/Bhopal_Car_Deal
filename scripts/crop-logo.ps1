Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile("public/images/main-logo.jpg")
$w = $src.Width
$h = $src.Height

$minX = $w; $minY = $h; $maxX = 0; $maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $src.GetPixel($x, $y)
        # Check if pixel is not black (brightness > 20)
        if (($c.R -gt 25) -or ($c.G -gt 25) -or ($c.B -gt 25)) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Content bounds: X: $minX to $maxX, Y: $minY to $maxY"
$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
Write-Host "Crop dimensions: ${cropW}x${cropH}"

# Add small padding (e.g. 8px)
$pad = 8
$targetX = [Math]::Max(0, $minX - $pad)
$targetY = [Math]::Max(0, $minY - $pad)
$targetW = [Math]::Min($w - $targetX, $cropW + ($pad * 2))
$targetH = [Math]::Min($h - $targetY, $cropH + ($pad * 2))

$rect = New-Object System.Drawing.Rectangle($targetX, $targetY, $targetW, $targetH)
$cropped = $src.Clone($rect, $src.PixelFormat)
$cropped.Save("public/images/logo-horizontal.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$cropped.Dispose()
$src.Dispose()

Write-Host "Saved public/images/logo-horizontal.jpg with dimensions: ${targetW}x${targetH}"
