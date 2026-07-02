# Deploy UPSC Genius AI to a HostingStar VPS (Ubuntu 22.04)

Full production deploy: Node 20 + Bun + PM2 + Nginx + Let's Encrypt SSL.
Estimated time: **30–40 min**.

---

## 0. Prerequisites

- HostingStar VPS (KVM, Ubuntu 22.04 recommended), root SSH access
- A domain (or subdomain) with DNS A-record pointing to the VPS public IP
- Your `.env` values ready (see bottom of this file)

SSH in:

```bash
ssh root@YOUR_VPS_IP
```

---

## 1. Base packages

```bash
apt update && apt upgrade -y
apt install -y curl git nginx ufw certbot python3-certbot-nginx build-essential

# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Bun (faster installs + build)
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc

# PM2 process manager
npm i -g pm2
```

Firewall:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## 2. Get the code

Option A — clone from GitHub (recommended):

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/<your-user>/<your-repo>.git upsc-genius
cd upsc-genius
```

Option B — upload zip via SFTP to `/var/www/upsc-genius`, then unzip.

---

## 3. Environment variables

Create `/var/www/upsc-genius/.env` with your real values (see template at the
bottom of this file). Then:

```bash
chmod 600 .env
```

---

## 4. Install + build for Node

```bash
cd /var/www/upsc-genius
bun install

# Build for VPS (uses node-server nitro preset)
DEPLOY_TARGET=node bun run build
```

Output lands in `.output/server/index.mjs`.

Quick sanity check:

```bash
PORT=3000 node .output/server/index.mjs
# In another terminal:  curl -I http://127.0.0.1:3000/
# Ctrl-C to stop.
```

---

## 5. Run with PM2

```bash
cd /var/www/upsc-genius

pm2 start .output/server/index.mjs \
  --name upsc-genius \
  --update-env \
  --env-file .env \
  -- PORT=3000

pm2 save
pm2 startup systemd -u root --hp /root   # copy-paste the command it prints, then run `pm2 save` again
```

Logs:

```bash
pm2 logs upsc-genius --lines 100
pm2 status
```

Redeploy after code changes:

```bash
cd /var/www/upsc-genius
git pull
bun install
DEPLOY_TARGET=node bun run build
pm2 restart upsc-genius --update-env
```

---

## 6. Nginx reverse proxy

Replace `yourdomain.com` throughout:

```bash
cat >/etc/nginx/sites-available/upsc-genius <<'NGINX'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 550M;   # allow 500 MB Drive uploads

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 300;
        proxy_send_timeout 300;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/upsc-genius /etc/nginx/sites-enabled/upsc-genius
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 7. Free SSL (Let's Encrypt)

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com \
  --agree-tos -m you@yourdomain.com --redirect --non-interactive

# Auto-renew is already scheduled by the certbot package. Verify:
systemctl list-timers | grep certbot
```

---

## 8. Re-register the Telegram webhook

Point the bot at your new HTTPS domain:

```bash
TOKEN=8943381719:REPLACE_WITH_NEW_TOKEN     # rotate the leaked one first!
URL=https://yourdomain.com/api/public/telegram/webhook

curl -s "https://api.telegram.org/bot$TOKEN/setWebhook" \
  --data-urlencode "url=$URL" \
  --data-urlencode 'allowed_updates=["message","channel_post","edited_message","edited_channel_post"]'

curl -s "https://api.telegram.org/bot$TOKEN/getWebhookInfo" | jq .
```

Expected: `"url": "https://yourdomain.com/api/public/telegram/webhook"` and
`"last_error_message"` absent.

---

## 9. Smoke tests

```bash
curl -I  https://yourdomain.com/
curl -sI https://yourdomain.com/api/public/telegram/webhook   # 405 or 401 = alive
```

Open the site, log in, send a PDF to the Telegram bot — it should appear in
**Inbox** within a few seconds.

---

## 10. `.env` template (put in `/var/www/upsc-genius/.env`)

```dotenv
# --- Supabase (public) ---
VITE_SUPABASE_URL=https://ffkyjnswyfeghmfmlapu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_vaeoI4DIfm2VoLkpLiGQUg_zd4IvuHh
SUPABASE_URL=https://ffkyjnswyfeghmfmlapu.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_vaeoI4DIfm2VoLkpLiGQUg_zd4IvuHh

# --- Supabase (server, secret) ---
APP_SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# --- AI providers ---
GROQ_API_KEY=YOUR_GROQ_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY
NVIDIA_API_KEY=YOUR_NVIDIA_KEY

# --- Google Drive OAuth (your own client) ---
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN=YOUR_GOOGLE_REFRESH_TOKEN
# Optional: pin a Drive folder
GOOGLE_DRIVE_ROOT_FOLDER_ID=

# --- Telegram (rotate the previously-shared token first!) ---
TELEGRAM_BOT_TOKEN=YOUR_NEW_BOT_TOKEN

# --- Runtime ---
NODE_ENV=production
PORT=3000
```

> **Reminder:** you shared a Telegram bot token in chat earlier. Open
> **@BotFather → /revoke** and generate a new one before pasting it here.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `502 Bad Gateway` | `pm2 logs upsc-genius` — likely env var missing or port mismatch |
| Telegram bot silent | `getWebhookInfo` → check `last_error_message`; ensure HTTPS is valid |
| Uploads fail >100MB | Confirm `client_max_body_size 550M;` is in the Nginx server block and `nginx -s reload` was run |
| `SUPABASE_SERVICE_ROLE_KEY missing` | `.env` not loaded — restart with `pm2 restart upsc-genius --update-env` |
| Build OOM on small VPS | Add swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile` |
