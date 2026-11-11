# Nginx امن برای DXCode

این کانفیگ فقط به `127.0.0.1:3000` (وب) و `127.0.0.1:4000` (API) پروکسی می‌کند — همان پورت‌هایی که `docker-compose.prod.yml` روی لوپ‌بک باز می‌کند.

## ۱) استک اپ روی سرور

```bash
cd /opt/htdev   # یا مسیر کلون شما
cp .env.production.example .env.production
nano .env.production   # دامنه HTTPS + رمزهای قوی

# الزامی:
# WEB_ORIGIN / NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_API_URL / API_PUBLIC_URL = https://...
# SESSION_SECRET / OTP_PEPPER / INTERNAL_SECURITY_TOKEN ≥ ۲۴ کاراکتر و متفاوت
# PAYMENT_MOCK_HOOKS=false و SPOTPLAYER_MOCK_HOOKS=false
# POSTGRES_PASSWORD قوی

pnpm prod:up
pnpm prod:migrate

curl -s http://127.0.0.1:3000/api/health
curl -s http://127.0.0.1:4000/health
```

Postgres و Redis از اینترنت دیده نمی‌شوند (فقط شبکهٔ Docker). فقط وب/API روی لوپ‌بک bind شده‌اند.

## ۲) فایروال (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

پورت‌های `3000` / `4000` / `5432` / `6379` را به اینترنت باز نکنید.

## ۳) نصب Nginx + Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

sudo mkdir -p /var/www/certbot /etc/nginx/snippets
sudo cp deploy/nginx/snippets/dxcode-proxy.conf /etc/nginx/snippets/
```

`limit_req_zone` باید داخل بلوک `http { }` باشد. اگر فایل سایت جداست، خطوط `limit_req_zone` / `limit_conn_zone` / `map` / `upstream` را از `dxcode.conf` به `/etc/nginx/nginx.conf` (داخل `http`) منتقل کنید و فقط `server { }`ها را در `sites-available` بگذارید.

نسخهٔ ساده‌تر برای شروع سریع:

```bash
# دامنه را جایگزین کنید
sudo sed -e 's/YOUR_DOMAIN/zharfa.example.com/g' \
         -e 's/YOUR_API_DOMAIN/api.zharfa.example.com/g' \
         deploy/nginx/dxcode.conf \
  | sudo tee /etc/nginx/sites-available/dxcode >/dev/null

# اگر ماژول headers-more ندارید، خط more_clear_headers را حذف کنید:
sudo sed -i '/more_clear_headers/d' /etc/nginx/sites-available/dxcode

sudo ln -sf /etc/nginx/sites-available/dxcode /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d zharfa.example.com -d api.zharfa.example.com
```

سپس در `.env.production` همهٔ URLها را `https://` کنید، `ENABLE_HSTS=true` بگذارید و استک را ری‌استارت کنید:

```bash
pnpm prod:up
```

## ۴) چه امنیتی در این کانفیگ هست؟

| مورد | کار |
|------|-----|
| TLS 1.2/1.3 + HSTS | اجبار HTTPS و جلوگیری از downgrade |
| فقط پروکسی به 127.0.0.1 | اپ از اینترنت مستقیم در دسترس نیست |
| `server_tokens off` | پنهان‌کردن نسخه Nginx |
| Rate limit عمومی/لاگین/API | کاهش brute-force و اسکن |
| بلاک `.env` / `.git` / wp-admin | قطع probeهای رایج |
| محدودیت حجم بدنه | کاهش upload abuse |
| هدرهای امنیتی | XSS/clickjacking mitigation پایه |

## ۵) نکات واقعی (نه شعار)

- Nginx به‌تنهایی جلوی «همهٔ هک» را نمی‌گیرد؛ اپ هم rate-limit، CSRF، و secret قوی دارد.
- SSH را با کلید قفل کنید؛ ورود پسوردی را ببندید.
- بکاپ منظم از volumeهای Postgres بگیرید.
- پنل `/admin` را فقط با حساب OWNER و پسورد قوی نگه دارید.
- بعد از دیپلوی مسیر خرید + callback درگاه را یک‌بار کامل تست کنید.

جزئیات بیشتر استک: [`docs/DEPLOYMENT.md`](../../docs/DEPLOYMENT.md)
