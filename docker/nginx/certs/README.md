# Generate self-signed certificate

Run this once from the `certs/` directory:

```bash
openssl req -x509 -newkey rsa:4096 \
  -keyout picobrew.key \
  -out picobrew.crt \
  -days 3650 \
  -nodes \
  -subj "/CN=picobrew.com" \
  -addext "subjectAltName=DNS:picobrew.com,DNS:*.picobrew.com"
```

This generates `picobrew.crt` and `picobrew.key` in this folder.

PicoBrew machines do not verify TLS certificates, so a self-signed cert is sufficient.
The cert is valid for 10 years — you won't need to renew it.

Do not commit `picobrew.crt` or `picobrew.key` to git.
