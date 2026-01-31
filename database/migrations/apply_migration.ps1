# PowerShell script to apply migration via Supabase REST API

$supabaseUrl = "https://bcqsjztmpslvmkrbgevi.supabase.co"
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcXNqenRtcHNsdm1rcmJnZXZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg3NTE2OCwiZXhwIjoyMDc5NDUxMTY4fQ.p-5GBTIII01btchxswR_w5smpzvpwaztTHKCcHdxIEo"

Write-Host "🔧 Applying migration to Supabase..." -ForegroundColor Cyan

$sql1 = "CREATE POLICY IF NOT EXISTS `"Anyone can create orders`" ON public.orders FOR INSERT WITH CHECK (true)"
$sql2 = "CREATE POLICY IF NOT EXISTS `"Anyone can create order items`" ON public.order_items FOR INSERT WITH CHECK (true)"

Write-Host "`n📝 Policy 1: Orders INSERT..." -ForegroundColor Yellow

try {
    $response1 = Invoke-RestMethod `
        -Uri "$supabaseUrl/rest/v1/rpc/exec" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "apikey" = $serviceRoleKey
            "Authorization" = "Bearer $serviceRoleKey"
        } `
        -Body (@{ sql = $sql1 } | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "✅ Policy 1 created successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Method failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Trying PostgreSQL connection..." -ForegroundColor Yellow
    
    # Alternative: Use psql if available
    $pgCommand = "psql `"postgresql://postgres.bcqsjztmpslvmkrbgevi:@bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres`" -c `"$sql1`""
    Write-Host "Run this command if you have psql:" -ForegroundColor Cyan
    Write-Host $pgCommand -ForegroundColor White
}

Write-Host "`n📝 Policy 2: Order Items INSERT..." -ForegroundColor Yellow

try {
    $response2 = Invoke-RestMethod `
        -Uri "$supabaseUrl/rest/v1/rpc/exec" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "apikey" = $serviceRoleKey
            "Authorization" = "Bearer $serviceRoleKey"
        } `
        -Body (@{ sql = $sql2 } | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "✅ Policy 2 created successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Method failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n" -NoNewline
Write-Host "🎉 Migration process complete!" -ForegroundColor Green
Write-Host "`nIf automatic application failed, copy this SQL to Supabase Dashboard:" -ForegroundColor Yellow
Write-Host @"

CREATE POLICY IF NOT EXISTS "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

"@ -ForegroundColor White

Write-Host "`n🧪 Test order placement at: http://localhost:3000" -ForegroundColor Cyan
