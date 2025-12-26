# CORS Troubleshooting & Cloudflare 522 Guide

## 🚨 Current Situation
*   **Frontend**: `https://promptlib.co.kr` (Cloudflare Pages)
*   **Backend**: `https://api.promptlib.co.kr` (AWS EC2)
*   **Error**:
    *   **Browser**: "No 'Access-Control-Allow-Origin' header is present" (CORS Error)
    *   **Curl**: `HTTP/2 522` (Cloudflare Connection Timed Out)

---

## 🔍 Root Cause Analysis

### 1. The Cloudflare 522 Error
The `522` error means Cloudflare **cannot connect to the origin server (EC2)**.
*   **Why?**: Cloudflare is configured to talk HTTPS (port 443) to the origin (due to "Full" SSL mode potentially), but our EC2 instance is likely listening on **HTTP (port 80)**.
*   **Result**: Cloudflare tries to handshake on 443, fails, times out (522), and sends an error page to the browser.
*   **CORS Side Effect**: Since the browser gets a Cloudflare Error Page (HTML) instead of the API response, it naturally lacks CORS headers. **The CORS error is a symptom, not the disease.**

### 2. The Solution Path

We must align Cloudflare and EC2 protocols.

#### Option A: Downgrade to HTTP (Quick Fix) ✅
Tell Cloudflare to talk HTTP to EC2, while keeping HTTPS for users.
1.  Cloudflare Dashboard -> SSL/TLS -> Overview.
2.  Set mode to **Flexible**. (User <-> Cloudflare = HTTPS, Cloudflare <-> EC2 = HTTP).
3.  Ensure EC2 Nginx is listening on Port 80.

#### Option B: Upgrade to HTTPS (Secure Fix - Recommended) 🔒
Install a certificate on EC2 so connection is end-to-end encrypted.
1.  Cloudflare Dashboard -> SSL/TLS -> Origin Server -> Create Certificate.
2.  Install this certificate on EC2 Nginx (Port 443).
3.  Set Cloudflare SSL mode to **Full (strict)**.

---

## 🛠️ Troubleshooting Steps Taken

1.  **Backend Config**: Updated `ALLOWED_ORIGINS` in FastAPI to include new domains.
2.  **Nginx Config**: Added explicit CORS headers (though now redundant if Backend is fixed, useful for 4xx/5xx errors).
3.  **Deploy Script**: Updated `force_deploy_ec2.sh` to handle container restarts cleanly.
4.  **Security Groups**: Verified Port 80/443 openness (AWS Security Group).

## 📝 Diagnostic Commands

**Check Connectivity (Bypass Cloudflare):**
```bash
# Test EC2 response directly (if Port 80 open to public)
curl -v http://***REMOVED_IP***/api/health-db
```

**Check Cloudflare Response:**
```bash
curl -I https://api.promptlib.co.kr/api/health-db
```
*   If `522`: Application is unreachable.
*   If `520`: Application crashed or sent empty response.
*   If `200`: Working.

**Check CORS Headers:**
```bash
curl -I -X OPTIONS https://api.promptlib.co.kr/api/prompts/ \
  -H "Origin: https://promptlib.co.kr" \
  -H "Access-Control-Request-Method: GET"
```
Look for `Access-Control-Allow-Origin: *` or `https://promptlib.co.kr`.
