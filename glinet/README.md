# GL.iNet Setup Guide

## Architecture

```
PicoBrew Machine
    ↓
GL.iNet Wi-Fi
    ↓ DNS: picobrew.com → 192.168.8.1 (router itself)
GL.iNet Router
    ↓ nginx HTTPS reverse proxy (self-signed cert)
https://www.piconew.com
```

The router intercepts PicoBrew traffic locally and proxies it to PicoNew. Your home internet is unaffected.

## What you need

- Any GL.iNet router running OpenWrt (tested with GL-SFT1200, GL-MT300N-V2, GL-AXT1800)
  - GL-SFT1200 (~$40 at Walmart) — recommended
  - GL-MT300N-V2 (~$25) — budget option, single-band
- Ethernet cable or home Wi-Fi to connect GL.iNet to the internet
- Mac, Linux, or Windows 10/11 computer to SSH into the router

## Step 1 — Connect GL.iNet to your home network

**Option A — Ethernet (recommended):**
Plug a cable from your home router's LAN port into the GL.iNet WAN port.

**Option B — Wi-Fi repeater:**
Open GL.iNet admin at `http://192.168.8.1` → Internet → Repeater → connect to your home Wi-Fi.

## Step 2 — SSH into the router

Connect your computer to the GL.iNet Wi-Fi, then open Terminal (Mac/Linux) or PowerShell/CMD (Windows):

```bash
ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa root@192.168.8.1
```

Password = your GL.iNet admin password (set on first login).

> **Note:** The `HostKeyAlgorithms` flag is required on modern macOS and Windows 10/11 — GL.iNet uses legacy ssh-rsa which newer OpenSSH hides by default.

## Step 3 — Configure DNS to point picobrew.com to the router

In the SSH session:

```bash
echo "address=/picobrew.com/192.168.8.1" >> /etc/dnsmasq.conf
echo "address=/.picobrew.com/192.168.8.1" >> /etc/dnsmasq.conf
/etc/init.d/dnsmasq restart
```

Verify from any device on the GL.iNet Wi-Fi:

```bash
nslookup www.picobrew.com
# Expected: Address: 192.168.8.1
```

## Step 4 — Install nginx with SSL support

```bash
opkg update
opkg install nginx-ssl
```

## Step 5 — Generate a self-signed TLS certificate

```bash
mkdir -p /etc/nginx/certs
openssl req -x509 -nodes -days 3650 \
  -newkey rsa:2048 \
  -keyout /etc/nginx/certs/picobrew.key \
  -out /etc/nginx/certs/picobrew.crt \
  -subj "/CN=www.picobrew.com"
```

> The CN must be `www.picobrew.com` — the PicoBrew machine connects to that hostname.

## Step 6 — Configure nginx reverse proxy

```bash
cat > /etc/nginx/conf.d/picobrew.conf << 'EOF'
server {
    listen 443 ssl;
    server_name www.picobrew.com picobrew.com;

    ssl_certificate     /etc/nginx/certs/picobrew.crt;
    ssl_certificate_key /etc/nginx/certs/picobrew.key;

    location / {
        proxy_pass https://www.piconew.com;
        proxy_ssl_server_name on;
        proxy_set_header Host www.piconew.com;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
EOF
```

Validate and start nginx:

```bash
nginx -t
/etc/init.d/nginx restart
/etc/init.d/nginx enable
```

## Step 7 — Verify the proxy

From your computer (still on GL.iNet Wi-Fi):

```bash
curl -vk https://www.picobrew.com
```

TLS handshake should succeed and return PicoNew content. Test a PicoBrew endpoint:

```bash
curl -vk "https://www.picobrew.com/Vendors/input.cshtml?type=ZState"
```

## Step 8 — Connect PicoBrew

On your PicoBrew machine, connect to the GL.iNet Wi-Fi network and power cycle it. It will now connect through PicoNew.

Optionally rename the Wi-Fi SSID to something recognizable: GL.iNet admin → Wireless → SSID.

## Troubleshooting

**DNS not redirecting:** Make sure dnsmasq was restarted after editing — `/etc/init.d/dnsmasq restart`.

**PicoBrew not connecting:** Confirm the machine is on GL.iNet Wi-Fi, not your home Wi-Fi.

**SSL handshake errors:** Verify the cert CN is exactly `www.picobrew.com` and nginx restarted cleanly (`nginx -t`).

**GL.iNet has no internet:** Check WAN connection — try switching from repeater to ethernet cable.

**nginx not installed:** Run `opkg update && opkg install nginx-ssl` again; `opkg update` must succeed first.
