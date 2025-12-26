# Troubleshooting Production Errors

## 1. 503 Service Unavailable (Render.com)
If you see `503 Service Unavailable` or `Network Error` for API calls (e.g., `/api/prompts/`), it means your backend server is not responding.

### Steps to Fix:
1.  **Check Render Dashboard:**
    *   Go to your [Render Dashboard](https://dashboard.render.com/).
    *   Click on your Web Service.
    *   Look at the **Logs** tab.

2.  **Common Issues in Logs:**
    *   **"Build Failed":** If the latest deployment failed, the old version might be down or not running. Check the "Events" tab.
    *   **"Application Error":** Look for Python tracebacks.
        *   *Database Connection Error:* Check if `DATABASE_URL` is correct and your Supabase database is active.
        *   *Module Not Found:* Check `requirements.txt`.
    *   **"No web service found":** Ensure your start command is correct: `uvicorn main:app --host 0.0.0.0 --port 10000`.
    *   **"could not translate host name" (DNS Error):**
        *   **Cause:** Using "Direct Connection" (`db...`) which fails to resolve in some regions.
        *   **Fix:** Switch to **Session Pooler** (`aws-0...`) in Supabase > Connect > Session Pooler. Update `DATABASE_URL`.

3.  **Cold Start (Free Tier):**
    *   If you are on the free tier, the server "sleeps" after inactivity. The first request might take 1-2 minutes to wake it up, causing a timeout (503) initially. Wait a minute and refresh.

## 2. CORS Errors
If you see `CORS error` in the browser console:

1.  **Check `ALLOWED_ORIGINS`:**
    *   In Render Dashboard > Environment, ensure `ALLOWED_ORIGINS` includes your frontend URL: `https://jinh2kakao.github.io`.
    *   *Note:* We updated the code to allow this by default, but setting the environment variable is best practice.

## 3. 404 Not Found (Frontend)
If you see a blank white screen or 404s for files:

1.  **Check `next.config.ts`:**
    *   Ensure `basePath` is set to `/Ainativepromptmanagermvp`.
    *   Ensure `output: 'export'` is set.

2.  **Redeploy Frontend:**
    *   Push a commit to trigger the GitHub Actions workflow.

## 4. User Role Reset Issues
If you find that your user role has been reset to 'user' (losing 'admin' access), it might be due to:
1.  **Database Reset:** If using SQLite (`prompt_manager.db`), deleting this file will wipe all data.
2.  **Environment Changes:** Switching between local and production databases.

### How to Restore Admin Access
You can run the provided script to grant admin privileges to a specific user:

```bash
# Run from the project root
/Users/jinh/Ainativepromptmanagermvp/backend/.venv/bin/python backend/scripts/grant_admin.py
```

To grant admin to a different user, edit `backend/scripts/grant_admin.py` and change the `target_user_id`.

## 5. AWS EC2 Common Errors

### 5.1 "Network Error" (CORS) or SSH Timeout
- **Symptoms**: API requests fail with Network Error / CORS. SSH is slow or unresponsive.
- **Cause**: `t3.micro` instance is out of CPU credits or RAM is full (Docker containers using too much).
- **Fix**:
    1. **Reboot**: Restart the instance via AWS Console if SSH is stuck.
    2. **Stop Worker**: `docker stop worker` to free up resources for the backend.

### 5.2 500 Internal Server Error (DataError / Code Not Updating)
- **Symptoms**: Logs show `sqlalchemy.exc.DataError: invalid input value for enum` OR code changes seem ignored.
- **Cause**: 
    - Database is Case-Sensitive (e.g., "GUEST" vs "guest").
    - Docker `COPY . .` is using a cached layer, ignoring your code updates.
- **Fix**:
    1. Update `backend/models.py` to match DB exactly.
    2. **Rebuild with --no-cache**: 
       ```bash
       docker build --no-cache --platform linux/amd64 -t ainative-backend ./backend
       ```
    3. Push to ECR and Pull on EC2.

## 6. AI Optimization Fails (500 Error / Gemini Key)
If clicking "Optimize" or "Evaluate" results in a `500 Internal Server Error` or "Failed to connect to AI service":

1.  **Check Backend Logs:**
    *   Look for `litellm.exceptions.AuthenticationError` or `401 Unauthorized` (often appearing as a 500 error in the frontend).
2.  **Verify API Key:**
    *   Ensure `GEMINI_API_KEY` is valid and not expired.
    *   Test the key locally using the Gemini API console or a simple Python script.
3.  **Update Key in Production:**
    *   **GitHub Secrets:** Go to Settings > Secrets and variables > Actions. Update `GEMINI_API_KEY`.
    *   **Redeploy:** Push a commit or manually trigger the deployment workflow to ensure the backend container picks up the new secret.
