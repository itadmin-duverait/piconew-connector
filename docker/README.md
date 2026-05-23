# Docker Setup Guide (Raspberry Pi / Laptop)

Runs three containers: dnsmasq (DNS), nginx (HTTPS), connector-service (proxy + logger).
Works on Raspberry Pi, any Linux machine, Mac, or Windows with Docker Desktop.

## Requirements

- Docker + Docker Compose installed
- The device must have a Wi-Fi adapter (to create a hotspot for PicoBrew)

## Step 1 — Clone and configure

```bash
cd connector/docker
cp .env.example .env
```

Edit `.env` — set `CONNECTOR_IP` to this machine's LAN IP address.

Find your IP:
- Linux/Pi: `ip addr show | grep "inet "` → look for `192.168.x.x`
- Mac: `ipconfig getifaddr en0` (Wi-Fi) or `en1`
- Windows: `ipconfig` → IPv4 Address

## Step 2 — Configure dnsmasq

Edit `dnsmasq/dnsmasq.conf` — replace `CONNECTOR_IP_PLACEHOLDER` with the same IP from `.env`.

## Step 3 — Generate TLS certificate

```bash
cd nginx/certs
openssl req -x509 -newkey rsa:4096 \
  -keyout picobrew.key \
  -out picobrew.crt \
  -days 3650 \
  -nodes \
  -subj "/CN=picobrew.com" \
  -addext "subjectAltName=DNS:picobrew.com,DNS:*.picobrew.com"
cd ../..
```

## Step 4 — Start the connector

```bash
docker compose up -d
```

Check all three containers are running:
```bash
docker compose ps
```

View live proxy logs:
```bash
docker compose logs -f connector-service
```

## Step 5 — Create a Wi-Fi hotspot for PicoBrew

Your PicoBrew must connect to a network whose DNS points to this machine.
The easiest way is a Wi-Fi hotspot on the same device running Docker.

**Raspberry Pi:**
```bash
# Install hostapd and dhcpcd if not present
sudo apt install hostapd dnsmasq

# Configure hostapd (/etc/hostapd/hostapd.conf):
# ssid=PicoNew Setup
# wpa_passphrase=yourpassword
# interface=wlan0
# ... (full config in docs/raspberry-pi-hotspot.md — coming soon)
```

**Mac:**
System Settings → General → Sharing → Internet Sharing → Share from: Ethernet → To: Wi-Fi.
Then set DNS for that network to `127.0.0.1`.

**Windows:**
Settings → Mobile Hotspot → share your ethernet connection.
Set hotspot adapter's DNS to `127.0.0.1` via adapter properties.

## Step 6 — Connect PicoBrew

On your PicoBrew machine, connect to the hotspot Wi-Fi you created.

## Step 7 — Verify

From a device on the same hotspot network:
```bash
nslookup picobrew.com <CONNECTOR_IP>
```
The returned IP should be `<CONNECTOR_IP>` itself.

Then watch the proxy log while your PicoBrew starts up:
```bash
docker compose logs -f connector-service
```
You should see requests appearing as the machine tries to reach picobrew.com.

## Stopping / updating

```bash
docker compose down        # stop
docker compose up -d       # restart
docker compose pull        # update images
```

## Troubleshooting

**Port 53 already in use (Linux):** `systemd-resolved` occupies port 53 by default.
```bash
sudo systemctl disable --now systemd-resolved
```

**PicoBrew not connecting:** Confirm it's on the hotspot, not your home Wi-Fi.

**502 errors in logs:** Connector can't reach piconew.com — check internet connectivity on the host.
