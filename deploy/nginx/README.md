# Nginx امن برای DXCode (حالت حداکثری)

پروکسی فقط به `127.0.0.1:3000` (وب) و `127.0.0.1:4000` (API).

## Path Traversal

نام حمله: **Path Traversal** / **Directory Traversal**.  
بلاک دقیق segment (`/../`، `%2e%2e%2f`، double-encode، …) — نه هر `..` وسط توکن.

## نصب / ارتقا روی سرور

```bash
cd ~/HTDev && git pull

sudo mkdir -p /var/www/certbot /var/www/empty /etc/nginx/snippets /etc/nginx/conf.d

sudo cp deploy/nginx/conf.d/dxcode-maps.conf \
        deploy/nginx/conf.d/dxcode-http.conf /etc/nginx/conf.d/

sudo cp deploy/nginx/snippets/dxcode-proxy.conf \
        deploy/nginx/snippets/dxcode-security.conf \
        deploy/nginx/snippets/dxcode-headers-web.conf \
        deploy/nginx/snippets/dxcode-headers-api.conf \
        /etc/nginx/snippets/

# فقط server{} — zone/upstream در conf.d است
sudo sed -e 's/YOUR_DOMAIN/dxcode.ir/g' \
         -e 's/YOUR_API_DOMAIN/api.dxcode.ir/g' \
         deploy/nginx/dxcode.conf \
  | sudo tee /etc/nginx/sites-available/dxcode >/dev/null

sudo ln -sf /etc/nginx/sites-available/dxcode /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# اگر ssl_certificate مسیر دیگری دارید اصلاح کنید؛ SAN مشترک → live/dxcode.ir
sudo nginx -t && sudo systemctl reload nginx
```

اگر `nginx -t` از duplicate `limit_req_zone` / `upstream` خطا داد، تعریف تکراری را از فایل‌های قدیمی داخل `sites-available` یا `conf.d` حذف کنید.

## چه چیزهایی سخت شده؟

| مورد | کار |
|------|-----|
| Path Traversal | maps + security snippet |
| Method allow-list | وب: GET/HEAD/POST/PUT/PATCH/DELETE/OPTIONS (BFF) — API: REST+OPTIONS |
| Rate limit | عمومی / auth سخت‌تر / API / استاتیک |
| TLS 1.2/1.3 | بدون session tickets؛ early data خاموش |
| هدرها | HSTS preload، XFO DENY، بدون CSP ضعیف تکراری |
| Scanner UA | nikto/sqlmap/nmap/… |
| Probe paths | `.env` `.git` wp-admin phpmyadmin … |
| default_server :80 | `444` برای Host ناشناس |
| Proxy | حذف Server/X-Powered-By، خنثی‌سازی X-Original-URL |

## تست سریع

```bash
curl -sI https://dxcode.ir | head
curl -sI -X PUT https://dxcode.ir/          # 405
curl -sI --path-as-is 'https://dxcode.ir/../../etc/passwd'  # 400/404
curl -sI 'https://dxcode.ir/.git/HEAD'      # 404
curl -s https://api.dxcode.ir/health
```
