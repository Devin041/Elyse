$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

$body = @{
    name = "Test Product"
    slug = "test-product-123"
    description = "Test description"
    basePrice = 5000
    salePrice = 3000
    categoryId = "c2cb0b07-86ef-4b5e-b2c0-466fa8a1cd50"
    sku = "MS11"
    isFeatured = $true
    images = @(
        "https://res.cloudinary.com/test/image1.jpg",
        "https://res.cloudinary.com/test/image2.jpg"
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/products" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response:"
    $_.ErrorDetails.Message
}
