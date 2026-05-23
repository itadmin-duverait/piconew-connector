# PicoNew Connector

The PicoNew Connector redirects your PicoBrew machine's traffic from the defunct `picobrew.com` servers to PicoNew — without touching your household internet or router.

Your PicoBrew connects to a dedicated "PicoNew Setup" network. Only that network's DNS is redirected. Everything else in your home is unaffected.

## Choose your setup

| | GL.iNet Router | Raspberry Pi / Laptop |
|---|---|---|
| **Hardware cost** | ~$25–$40 | Pi ~$35 + SD card, or existing device |
| **Complexity** | Very low | Low |
| **Always-on** | Yes | Pi: yes / Laptop: no |
| **Traffic logging** | No | Yes |
| **Docker required** | No | Yes |

### Option A — GL.iNet Travel Router (recommended for most users)

Plug a small travel router between your PicoBrew and your home network. Configure dnsmasq in 2 minutes via the router's web UI. No ongoing maintenance, no laptop required.

→ [GL.iNet Setup Guide](glinet/README.md)

### Option B — Docker (Raspberry Pi or any computer)

Docker Compose runs dnsmasq + nginx + a proxy service that logs all PicoBrew traffic. Best if you want visibility into what the machine sends, or if you already have a Pi running 24/7.

→ [Docker Setup Guide](docker/README.md)

---

## How it works

```
PicoBrew machine
  → connects to PicoNew Wi-Fi (GL.iNet or Pi hotspot)
  → DNS query for picobrew.com → returned as piconew.com IP
  → HTTPS request → piconew.com
  → your recipes, sessions, everything works again
```
