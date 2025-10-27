# Deployment Guide

Deploy your Bosphorus International Certificate System to production.

## Option 1: Vercel (Recommended) ⭐

Vercel is the easiest and fastest way to deploy Next.js applications.

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Your code pushed to GitHub

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/bosphorus-international.git
git push -u origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
     ```
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site is live! 🎉

5. **Custom Domain (Optional)**
   - Settings → Domains
   - Add your custom domain (e.g., certificates.bosphorusinternational.com)
   - Follow DNS configuration instructions

### Vercel Benefits
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Preview deployments for branches
- ✅ Zero configuration
- ✅ Free tier available

---

## Option 2: Netlify

### Steps

1. **Push to GitHub** (same as Vercel)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add your Supabase URL and key

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

---

## Option 3: Railway

Great for full-stack deployments with more control.

### Steps

1. **Push to GitHub**

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Configure**
   - Railway auto-detects Next.js
   - Add environment variables in Settings → Variables

4. **Deploy**
   - Automatic deployment starts
   - Get your production URL

---

## Option 4: DigitalOcean App Platform

### Steps

1. **Push to GitHub**

2. **Create App**
   - Go to [DigitalOcean](https://digitalocean.com)
   - Apps → Create App
   - Connect GitHub repository

3. **Configure**
   - Detected type: Web Service
   - Build command: `npm run build`
   - Run command: `npm start`

4. **Environment Variables**
   - Add Supabase credentials

5. **Deploy**
   - Choose plan (starts at $5/month)
   - Launch app

---

## Option 5: Self-Hosted (VPS)

For advanced users who want full control.

### Prerequisites
- VPS (Ubuntu 20.04+ recommended)
- Domain name
- SSH access

### Steps

1. **Set Up Server**
```bash
# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2
```

2. **Clone Repository**
```bash
cd /var/www
git clone https://github.com/yourusername/bosphorus-international.git
cd bosphorus-international
```

3. **Install Dependencies**
```bash
npm install
```

4. **Create Environment File**
```bash
nano .env.local
```
Add your Supabase credentials, save (Ctrl+X, Y, Enter)

5. **Build Application**
```bash
npm run build
```

6. **Start with PM2**
```bash
pm2 start npm --name "bosphorus-cert" -- start
pm2 save
pm2 startup
```

7. **Set Up Nginx**
```bash
apt install nginx

nano /etc/nginx/sites-available/bosphorus-cert
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/bosphorus-cert /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

8. **Install SSL Certificate**
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## Post-Deployment Checklist

### Test All Features

- [ ] Home page loads correctly
- [ ] Admin dashboard is accessible
- [ ] Can create a new student
- [ ] Photo upload works
- [ ] QR code generates
- [ ] Certificate page displays with confetti
- [ ] All courses show correctly
- [ ] Mobile responsive on phones
- [ ] SSL certificate is active (HTTPS)

### Security

- [ ] Change Supabase database password (if using default)
- [ ] Set up admin authentication (see README for future enhancements)
- [ ] Enable Supabase database backups
- [ ] Review RLS policies in Supabase
- [ ] Add rate limiting (if using self-hosted)
- [ ] Set up monitoring/alerts

### Performance

- [ ] Test page load speeds
- [ ] Check image optimization
- [ ] Verify CDN is working
- [ ] Test from different locations
- [ ] Mobile network testing

### SEO (Optional)

- [ ] Add meta descriptions
- [ ] Create sitemap
- [ ] Add robots.txt
- [ ] Set up analytics

---

## Environment Variables Reference

Required for all deployment platforms:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

Optional (for advanced features):

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Bosphorus International
```

---

## Troubleshooting Deployment

### Build Fails

**Error**: "Module not found"
- Solution: Check all imports in code
- Verify dependencies in package.json

**Error**: "Environment variable missing"
- Solution: Add all required env vars to platform
- Check variable names (case-sensitive)

### Runtime Errors

**Error**: "Failed to fetch"
- Solution: Verify Supabase URL and keys
- Check Supabase project is not paused
- Verify network connectivity

**Error**: "413 Payload Too Large"
- Solution: Increase file upload limit
- Configure in your hosting platform
- Or in nginx for self-hosted

### Certificate Issues

**Photos not loading**
- Check Supabase storage bucket is public
- Verify CORS settings in Supabase
- Check image URLs are accessible

**QR codes not generating**
- Verify qrcode package is installed
- Check browser console for errors
- Ensure sufficient memory/resources

---

## Updating Production

### For Git-Based Deployments (Vercel, Netlify, etc.)

```bash
# Make changes locally
git add .
git commit -m "Update: description of changes"
git push origin main
```

Deployment happens automatically!

### For Self-Hosted

```bash
# Connect to server
ssh root@your-server-ip

# Navigate to project
cd /var/www/bosphorus-international

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart application
pm2 restart bosphorus-cert
```

---

## Backup Strategy

### Database Backups (Supabase)

1. Supabase Dashboard → Database → Backups
2. Enable automatic daily backups
3. Or manually export:
   ```sql
   -- In SQL Editor
   -- Export specific tables
   COPY students TO STDOUT CSV HEADER;
   ```

### File Backups

**For Vercel/Netlify**: Your GitHub repo is your backup
**For Self-Hosted**: Set up automated backups

```bash
# Install backup tool
npm install -g @supabase/cli

# Configure backup script
nano /root/backup.sh
```

---

## Monitoring

### Vercel Analytics
- Included free with Vercel
- Enable in project settings

### Supabase Dashboard
- Monitor API usage
- Check database performance
- View error logs

### Custom Monitoring
- Set up [Sentry](https://sentry.io) for error tracking
- Use [Google Analytics](https://analytics.google.com) for visitor stats
- Configure [Uptime Robot](https://uptimerobot.com) for uptime monitoring

---

## Cost Estimates

### Vercel (Hobby)
- **Cost**: Free
- **Limits**: 100GB bandwidth, Serverless functions
- **Best for**: Small to medium deployments

### Netlify (Free)
- **Cost**: Free
- **Limits**: 100GB bandwidth, 300 build minutes
- **Best for**: Small deployments

### Railway (Starter)
- **Cost**: $5/month
- **Includes**: 512MB RAM, 1GB disk
- **Best for**: Small apps with database

### DigitalOcean App Platform
- **Cost**: $5-12/month
- **Includes**: 512MB RAM, 1 vCPU
- **Best for**: Production apps

### Self-Hosted VPS
- **Cost**: $5-20/month (DigitalOcean, Linode, Vultr)
- **Includes**: Full server access
- **Best for**: Full control, multiple apps

### Supabase
- **Free Tier**: 500MB database, 1GB storage
- **Pro**: $25/month (8GB database, 100GB storage)

---

## Support After Deployment

If you encounter issues after deployment:

1. Check deployment logs in your hosting platform
2. Verify environment variables are set correctly
3. Check Supabase project status
4. Test locally with `npm run build && npm start`
5. Review error messages in browser console

---

## Recommended: Start with Vercel

For most users, we recommend:

1. ✅ **Start**: Deploy to Vercel (free, easy)
2. ✅ **Test**: Verify everything works
3. ✅ **Use**: Run for a few weeks
4. ✅ **Scale**: Upgrade or migrate if needed

You can always migrate to another platform later if needed.

---

Good luck with your deployment! 🚀

