# Fixing YouTube Bot Detection

If you encounter the error **"Sign in to confirm you're not a bot"**, this is YouTube's anti-bot protection. Follow these steps to fix it:

## Solution: Add YouTube Cookies

### Step 1: Get Your YouTube Cookies

1. **Sign in to YouTube** in your browser (Chrome, Firefox, etc.)
2. **Open Developer Tools**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

3. **Navigate to Cookies**:
   - Chrome/Edge: Go to `Application` tab → `Storage` → `Cookies` → `https://www.youtube.com`
   - Firefox: Go to `Storage` tab → `Cookies` → `https://www.youtube.com`

4. **Copy Important Cookies**:
   Look for these cookies and copy their values:
   - `VISITOR_INFO1_LIVE`
   - `PREF`
   - `YSC`
   - `__Secure-1PSID` (if available)
   - `__Secure-3PSID` (if available)

5. **Format as Cookie String**:
   Combine them in this format:
   ```
   VISITOR_INFO1_LIVE=value1; PREF=value2; YSC=value3; __Secure-1PSID=value4;
   ```

### Step 2: Add to Environment Variables

1. Create a file named `.env.local` in your project root (same directory as `package.json`)

2. Add this line with your cookies:
   ```
   YOUTUBE_COOKIES=VISITOR_INFO1_LIVE=xxx; PREF=xxx; YSC=xxx;
   ```

3. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

### Step 3: Test

Try downloading a video again. The bot detection error should be resolved!

## Important Notes

- **Keep cookies private**: Never commit `.env.local` to git (it's already in `.gitignore`)
- **Cookies expire**: If you get the error again after some time, refresh your cookies
- **Alternative**: Use a VPN or different network if you don't want to use cookies

## For Deployment (Vercel)

Add the `YOUTUBE_COOKIES` environment variable in your Vercel project settings:
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add `YOUTUBE_COOKIES` with your cookie string
4. Redeploy your application
