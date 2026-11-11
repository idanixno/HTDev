# راه‌اندازی DXCode روی سرور (صفر تا صد)

این راهنما برای کسی نوشته شده که می‌خواهد **DXCode** را روی یک سرور لینوکس (مثلاً Ubuntu) بالا بیاورد. زبان ساده است؛ اگر جایی گیر کردید، همان قدم را دوباره بخوانید.

> شناسه‌های داخلی زیرساخت/پکیج (`@zharfa/*`، دیتابیس `zharfa`، کوکی `zharfa_session`) عمداً عوض نشده‌اند — برند عمومی محصول DXCode است. جزئیات: [`BRANDING.md`](./BRANDING.md).

---

## مسیر پیشنهادی پروداکشن: Docker Compose کامل

روی یک VPS با Docker:

```bash
cp .env.production.example .env.production
nano .env.production   # دامنه HTTPS + رمزهای قوی + POSTGRES_PASSWORD

pnpm prod:up           # web + api + worker + postgres + redis
pnpm prod:migrate      # prisma migrate deploy

# TLS را با Caddy/Nginx روی هاست به 127.0.0.1:3000 (وب) و 127.0.0.1:4000 (API) وصل کنید
curl -s http://127.0.0.1:4000/health
curl -s http://127.0.0.1:4001/health
curl -s http://127.0.0.1:3000/api/health
```

نکات حیاتی:

- `PAYMENT_MOCK_HOOKS` و `SPOTPLAYER_MOCK_*` باید `false` باشند؛ در غیر این صورت API/worker/web **استارت نمی‌شوند**
- `SESSION_SECRET`، `OTP_PEPPER`، `INTERNAL_SECURITY_TOKEN` ≥۲۴ کاراکتر و متفاوت از هم
- `WEB_ORIGIN` / `NEXT_PUBLIC_SITE_URL` / `API_PUBLIC_URL` باید `https://...` باشند
- seed در پروداکشن اجباری نیست؛ در صورت نیاز یک‌بار با پسورد قوی بزنید
- `/design-system` در پروداکشن مخفی است (۴۰۴)

جزئیات env: [`.env.production.example`](../.env.production.example)

اگر ترجیح می‌دهید بدون Docker ایمیج اپ‌ها، از قدم‌های زیر (نصب Node روی هاست + Compose فقط برای Postgres/Redis) استفاده کنید.

---

## ژرفا چیست و روی سرور چه چیزهایی لازم است؟

ژرفا سه برنامه اصلی دارد:

| برنامه | کار | پورت معمول |
|--------|-----|------------|
| **وب** (`apps/web`) | سایت و پنل | `3000` |
| **API** (`apps/api`) | منطق سرور، پرداخت، لاگین | `4000` |
| **Worker** (`apps/worker`) | کارهای پس‌زمینه (مثلاً لایسنس اسپات‌پلیر) | سلامت: `4001` |

و دو سرویس کمکی:

- **PostgreSQL** — دیتابیس
- **Redis** — صف و محدودیت نرخ

در توسعهٔ محلی، Postgres و Redis با Docker بالا می‌آیند. روی سرور می‌توانید همان Docker را نگه دارید یا Postgres/Redis جدا بگذارید.

---

## پیش‌نیازها (قبل از هر چیز)

روی سرور این‌ها را نصب کنید:

1. **Node.js 20 یا بالاتر**
2. **pnpm** (نسخهٔ پروژه در `package.json` آمده؛ الان حدود `10.x`)
3. **Docker** و **Docker Compose** (اگر می‌خواهید Postgres/Redis را با Compose بیاورید)
4. **Git**
5. یک دامنه (اختیاری ولی برای پرداخت واقعی لازم است) که به IP سرور اشاره کند

نمونه نصب Node با nvm (پیشنهادی):

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# ترمینال را ببندید و دوباره باز کنید
nvm install 20
nvm use 20
corepack enable
corepack prepare pnpm@10.33.4 --activate
```

---

## قدم ۱ — گرفتن کد

```bash
cd /opt   # یا هر مسیری که دوست دارید
git clone https://github.com/idanixno/htdev.git zharfa
cd zharfa
```

---

## قدم ۲ — فایل تنظیمات (`.env`)

```bash
cp .env.example .env
nano .env   # یا ویرایشگر دیگر
```

### چیزهایی که روی سرور حتماً عوض کنید

| کلید | چه بگذارید |
|------|------------|
| `NODE_ENV` | `production` |
| `WEB_ORIGIN` | آدرس عمومی سایت، مثل `https://zharfa.example.com` |
| `NEXT_PUBLIC_SITE_URL` | همان آدرس عمومی سایت |
| `NEXT_PUBLIC_API_URL` | آدرس عمومی API، مثل `https://api.zharfa.example.com` یا `https://zharfa.example.com` اگر پشت یک دامنه پروکسی شده |
| `API_INTERNAL_URL` | آدرسی که **وب روی خود سرور** برای حرف زدن با API استفاده می‌کند؛ معمولاً `http://127.0.0.1:4000` |
| `API_PUBLIC_URL` | آدرس API که درگاه پرداخت بتواند به آن برگردد (باید از اینترنت دیده شود) |
| `DATABASE_URL` | رشتهٔ اتصال Postgres واقعی |
| `REDIS_URL` | آدرس Redis واقعی |
| `SESSION_SECRET` | یک رشتهٔ بلند و تصادفی |
| `OTP_PEPPER` | یک رشتهٔ بلند و تصادفی دیگر |
| `SEED_ADMIN_PASSWORD` / `SEED_STUDENT_PASSWORD` | فقط اگر می‌خواهید seed بزنید؛ بعداً عوض کنید |
| `ENABLE_HSTS` | فقط وقتی HTTPS کامل دارید: `true` |
| `PAYMENT_MOCK_HOOKS` | روی سرور واقعی همیشه `false` |
| `SPOTPLAYER_MOCK_HOOKS` | روی سرور واقعی همیشه `false` |

### پرداخت آقای‌پرداخت / زرین‌پال

- برای تست سندباکس آقای‌پرداخت: `AQAYE_PARDAKHT_PIN` را خالی بگذارید و `AQAYE_PARDAKHT_SANDBOX=true`
- برای فروش واقعی: پین واقعی را بگذارید و سندباکس را خاموش کنید
- `API_PUBLIC_URL` باید دقیقاً دامنه‌ای باشد که در پنل درگاه مجاز شده

### اسپات‌پلیر

تا وقتی کلید واقعی ندارید، فیلدها را خالی بگذارید. لایسنس واقعی ساخته نمی‌شود مگر با اعتبار واقعی.

**هرگز فایل `.env` را داخل Git نگذارید.**

---

## قدم ۳ — روشن کردن Postgres و Redis

اگر Docker دارید:

```bash
pnpm docker:up
pnpm docker:ps
```

صبر کنید تا healthcheck سبز شود. اگر Postgres/Redis جدا دارید، فقط `DATABASE_URL` و `REDIS_URL` را درست کنید و این قدم را رد کنید.

---

## قدم ۴ — نصب پکیج‌ها

```bash
pnpm install
```

---

## قدم ۵ — دیتابیس: ساخت جداول و دادهٔ اولیه

```bash
# ساخت کلاینت Prisma
pnpm db:generate

# اعمال migrationها روی سرور (مهم: deploy نه dev)
pnpm --filter @zharfa/database migrate:deploy

# (اختیاری) دادهٔ دمو — فقط اگر می‌خواهید ادمین/دانشجو نمونه داشته باشید
pnpm db:seed
```

بعد از seed (اگر زده باشید):

- ادمین: یوزرنیم `admin` — رمز همان `SEED_ADMIN_PASSWORD`
- پنل: `/admin`
- داشبورد دانشجو: `/dashboard`

---

## قدم ۶ — بیلد برای تولید

```bash
pnpm build
```

این دستور همهٔ پکیج‌ها و اپ‌ها را برای production می‌سازد. اگر خطا داد، همان خطا را کامل بخوانید (معمولاً TypeScript یا env ناقص است).

---

## قدم ۷ — اجرای سرویس‌ها

برای تست دستی (سه ترمینال جدا):

```bash
# ترمینال ۱ — API
pnpm --filter @zharfa/api start:prod

# ترمینال ۲ — Worker
pnpm --filter @zharfa/worker start

# ترمینال ۳ — وب
pnpm --filter @zharfa/web start
```

بررسی سلامت:

```bash
curl -s http://127.0.0.1:4000/health
curl -s http://127.0.0.1:4001/health
curl -sI http://127.0.0.1:3000
```

برای اجرای پایدار روی سرور، از **systemd** یا **PM2** استفاده کنید تا با بستن SSH خاموش نشوند.

### نمونهٔ ساده با PM2

```bash
npm i -g pm2

pm2 start "pnpm --filter @zharfa/api start:prod" --name zharfa-api
pm2 start "pnpm --filter @zharfa/worker start" --name zharfa-worker
pm2 start "pnpm --filter @zharfa/web start" --name zharfa-web

pm2 save
pm2 startup
```

---

## قدم ۸ — Nginx (پیشنهادی) و HTTPS

مرورگر نباید مستقیم به پورت‌های داخلی بزند. Nginx را جلوی وب/API بگذارید.

### مثال ساده: یک دامنه برای سایت، API زیر همان دامنه با `/api-backend` یا ساب‌دامین

**حالت رایج‌تر: ساب‌دامین**

- `https://zharfa.example.com` → وب `:3000`
- `https://api.zharfa.example.com` → API `:4000`

نمونهٔ اسکچ Nginx برای وب:

```nginx
server {
  listen 80;
  server_name zharfa.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

و برای API:

```nginx
server {
  listen 80;
  server_name api.zharfa.example.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

سپس با Certbot گواهی بگیرید:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d zharfa.example.com -d api.zharfa.example.com
```

بعد از HTTPS:

1. در `.env` همهٔ URLهای عمومی را با `https://` بگذارید
2. `ENABLE_HSTS=true`
3. سرویس‌ها را ری‌استارت کنید

---

## قدم ۹ — کانفیگ بعد از بالا آمدن

1. با ادمین وارد `/admin` شوید
2. **پرداخت‌ها** را در `/admin/payments` چک کنید (سندباکس/پین)
3. **اسپات‌پلیر** را در ادمین تنظیم کنید
4. در صورت نیاز کلید OpenAI و یکپارچگی‌ها را از ادمین بگذارید (ترجیحاً به‌جای فقط `.env`)
5. یک خرید آزمایشی با سندباکس انجام دهید و callback را تست کنید

---

## به‌روزرسانی نسخهٔ جدید روی سرور

```bash
cd /opt/zharfa
git pull
pnpm install
pnpm db:generate
pnpm --filter @zharfa/database migrate:deploy
pnpm build
pm2 restart zharfa-api zharfa-worker zharfa-web
# یا معادل systemd
```

---

## عیب‌یابی سریع

| مشکل | کار |
|------|-----|
| سایت بالا نمی‌آید | `pnpm --filter @zharfa/web start` را ببینید؛ پورت `3000` آزاد است؟ |
| لاگین کار نمی‌کند | `API_INTERNAL_URL` و کوکی/دامنه را چک کنید |
| پرداخت برنمی‌گردد | `API_PUBLIC_URL` از اینترنت دیده می‌شود؟ دامنه در پنل درگاه ثبت شده؟ |
| دیتابیس خطا می‌دهد | `DATABASE_URL` و وضعیت Postgres (`pnpm docker:ps`) |
| migration روی سرور خطا | حتماً `migrate:deploy` بزنید نه `db:migrate` (dev) |
| OTP را نمی‌بینید | در این نسخه OTP در لاگ کنسول API چاپ می‌شود مگر SMS واقعی وصل شده باشد |

---

## چک‌لیست نهایی قبل از فروش واقعی

- [ ] `NODE_ENV=production`
- [ ] رمزهای `SESSION_SECRET` و `OTP_PEPPER` قوی و یکتا
- [ ] HTTPS فعال و `ENABLE_HSTS=true`
- [ ] `PAYMENT_MOCK_HOOKS=false` و `SPOTPLAYER_MOCK_HOOKS=false`
- [ ] اعتبار واقعی درگاه و اسپات‌پلیر
- [ ] بکاپ منظم از Postgres
- [ ] دسترسی SSH و پنل ادمین محدود شده

---

## یادداشت صادقانه

این پروژه برای اجرای واقعی آمادهٔ پایه است، ولی «آمادهٔ فروش بدون تست دستی» نیست. بعد از دیپلوی حتماً مسیر خرید، callback، لایسنس و تیکت را خودتان یک‌بار از اول تا آخر تست کنید.
