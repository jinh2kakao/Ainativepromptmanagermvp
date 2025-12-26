# Implementation Plan - AWS Migration Phase 4: SSL & CORS Resolution

## Goal Description
Enable End-to-End HTTPS for the backend API (`api.promptlib.co.kr`) on AWS EC2 to resolve "Mixed Content" errors from the frontend (`promptlib.co.kr`) and fix persistent CORS issues ensuring secure and reliable communication.

## User Review Required
> [!IMPORTANT]
> **Cloudflare SSL Mode**: Must be set to **Full (strict)** after EC2 configuration is complete.
> **AWS Region**: Verify EC2 instance region matches Security Group region (Singapore vs Sydney).

## Proposed Changes

### Infrastructure
#### [MODIFY] AWS Security Groups
-   Open Port 443 (HTTPS) on the EC2 instance's security group.
-   Ensure the rule allows traffic from Cloudflare IPs (or 0.0.0.0/0 for simplicity if using Origin Cert authentication).

#### [NEW] SSL Certificates
-   Generate Cloudflare Origin Certificate and Private Key.
-   Upload to EC2 (`/etc/nginx/ssl/`).

### Web Server (Nginx)
#### [NEW] `/etc/nginx/conf.d/api.conf`
-   Configure Server Block for Port 443.
-   Enable SSL with the uploaded certificates.
-   Configure Proxy Pass to FastAPI (Port 8000).
-   **CORS Handling**:
    -   Handle `OPTIONS` preflight requests directly in Nginx.
    -   Allow `x-guest-id` and Credentials.
    -   Use `map` for dynamic Origin validation.
    -   **Crucial**: Do NOT add CORS headers for proxied requests (GET/POST) to avoid duplication with FastAPI.

### Application Code
#### [MODIFY] `backend/main.py`
-   Update `ALLOWED_ORIGINS` to include `https://promptlib.co.kr` and `https://www.promptlib.co.kr`.

## Verification Plan

### Automated Tests
-   `curl` connection tests to Port 443.
-   `curl` OPTIONS request tests to verify CORS headers.
-   Browser console inspection for network errors.

### Manual Verification
1.  Navigate to `https://promptlib.co.kr`.
2.  Login/Use Guest Mode.
3.  Verify API calls (e.g., fetch templates, list prompts) succeed without "Network Error" or "Mixed Content" warnings.
