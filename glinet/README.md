# GL.iNet Setup Guide

## What you need

- Any GL.iNet router running OpenWrt (tested with GL-SFT1200, GL-MT300N-V2, GL-AXT1800)
  - GL-SFT1200 (~$40 at Walmart) — recommended
  - GL-MT300N-V2 (~$25) — budget option, single-band
- An ethernet cable or your home Wi-Fi to connect the GL.iNet to the internet

## Step 1 — Connect GL.iNet to your home network

**Option A — Ethernet (most reliable):**
Plug a cable from your home router's LAN port into the GL.iNet's WAN port.

**Option B — Wi-Fi repeater:**
In the GL.iNet admin panel → Internet → Repeater → connect to your home Wi-Fi.

## Step 2 — Find PicoNew's IP address

On any computer, run:

```bash
dig +short piconew.com
```

Or use an online tool: search "DNS lookup piconew.com". Note the IP address returned (e.g. `76.76.21.21`).

## Step 3 — Configure dnsmasq

Open the GL.iNet admin panel at `http://192.168.8.1` (default).

**Option A — Web UI (no SSH needed):**
1. Go to **Advanced** → **Custom DNS**
2. Paste the contents of [`dnsmasq.conf`](dnsmasq.conf), replacing `PICONEW_IP` with the IP from Step 2
3. Save and apply

**Option B — SSH:**
```bash
ssh root@192.168.8.1
echo "address=/picobrew.com/PICONEW_IP" >> /etc/dnsmasq.conf
echo "address=/.picobrew.com/PICONEW_IP" >> /etc/dnsmasq.conf
/etc/init.d/dnsmasq restart
```

## Step 4 — Connect PicoBrew to GL.iNet Wi-Fi

On your PicoBrew machine, connect to the GL.iNet's Wi-Fi network (default name is `GL-XXXX-XXX`).

Optionally rename it to something like `PicoNew Setup` in GL.iNet admin → Wireless → SSID.

## Step 5 — Verify

From a device connected to the GL.iNet network:

```bash
nslookup picobrew.com 192.168.8.1
```

The returned IP should match the PicoNew IP from Step 2. If it does, your PicoBrew will now connect to PicoNew.

## Troubleshooting

**DNS not redirecting:** Make sure you restarted dnsmasq after editing the config (`/etc/init.d/dnsmasq restart`).

**PicoBrew not connecting:** Confirm the machine is on the GL.iNet Wi-Fi, not your home Wi-Fi.

**GL.iNet has no internet:** Check the WAN connection — try switching from repeater to ethernet cable.

**PicoNew IP changed:** Repeat Steps 2–3 with the new IP. This is rare but possible with cloud deployments.
