# Quick Deployment Guide

Get Clavier deployed to production in under 10 minutes.

## Option 1: Vercel (Fastest - 5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- PostgreSQL database (Supabase recommended)

### Steps

1. **Fork/Clone Repository**
```bash
git clone https://github.com/yourusername/clavier.git
cd clavier
```

2. **Install Vercel CLI**
```bash
npm install -g vercel
vercel login
```

3. **Setup Database (Supabase)**
- Go to [supabase.com](https://supabase.com)
- Create new project
- Copy connection strings from Settings → Database

4. **Deploy to Vercel**
```bash
vercel
```

5. **Add Environment Variables**

Via Vercel Dashboard:
- Project Settings → Environment Variables
- Add all variables from `.env.production.example`

Or via CLI:
```bash
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add ANTHROPIC_API_KEY production
# ... add all required variables
```

6. **Deploy to Production**
```bash
vercel --prod
```

7. **Setup Database**
```bash
npm run prisma:migrate:deploy
```

**Done!** Your app is live at `https://your-project.vercel.app`

---

## Option 2: Docker (Self-Hosted - 10 minutes)

### Prerequisites
- Docker & Docker Compose installed
- Domain name (optional)
- SSL certificate (Let's Encrypt recommended)

### Steps

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/clavier.git
cd clavier
```

2. **Configure Environment**
```bash
cp .env.production.example .env.production
nano .env.production  # Edit with your values
```

**Minimum required variables:**
```bash
DATABASE_URL="postgresql://clavier:YOUR_PASSWORD@postgres:5432/clavier"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://your-domain.com"
ANTHROPIC_API_KEY="sk-ant-api03-YOUR_KEY"
GOOGLE_TTS_API_KEY="YOUR_GOOGLE_KEY"  # Or Azure/ElevenLabs
```

3. **Build and Start**
```bash
docker-compose up -d
```

4. **Run Database Migrations**
```bash
docker-compose exec app npx prisma migrate deploy
```

5. **Verify Deployment**
```bash
curl http://localhost:3000/api/health
```

6. **Setup Nginx Reverse Proxy (Optional)**

```nginx
# /etc/nginx/sites-available/clavier
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

7. **Enable SSL (Let's Encrypt)**
```bash
sudo certbot --nginx -d your-domain.com
```

**Done!** Your app is live at `https://your-domain.com`

---

## Environment Variables Checklist

### Required

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `ANTHROPIC_API_KEY` - Claude API key

### TTS Provider (Choose one)

- [ ] `GOOGLE_TTS_API_KEY` - Google Cloud TTS
- [ ] `AZURE_TTS_KEY` + `AZURE_TTS_REGION` - Azure Cognitive Services
- [ ] `ELEVENLABS_API_KEY` - ElevenLabs

### Optional

- [ ] `REDIS_URL` - For caching and rate limiting
- [ ] `SENTRY_DSN` - Error tracking
- [ ] `SMTP_*` - Email notifications

---

## Post-Deployment Checklist

- [ ] Health check passes: `/api/health`
- [ ] Database migrations applied
- [ ] Environment variables set correctly
- [ ] SSL certificate valid (HTTPS)
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error tracking configured
- [ ] Backup strategy in place

---

## Troubleshooting

### Build Fails

**Error:** `MODULE_NOT_FOUND`
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Error

**Error:** `P1001: Can't reach database server`

**Solutions:**
1. Verify DATABASE_URL is correct
2. Check database is running: `docker-compose ps`
3. Check firewall allows connections
4. For Supabase: Use connection pooling URL

### 502 Bad Gateway (Docker)

**Solutions:**
```bash
# Check app logs
docker-compose logs app

# Restart services
docker-compose restart

# Rebuild if necessary
docker-compose up -d --build
```

### Rate Limit Issues

**Solution:** Configure Redis for production rate limiting:
```bash
# Add to docker-compose.yml
REDIS_URL=redis://redis:6379
```

---

## Performance Optimization

### CDN Setup (Vercel)
- Automatic global CDN
- Edge caching enabled
- Image optimization included

### CDN Setup (Self-Hosted)

**Cloudflare:**
1. Add domain to Cloudflare
2. Enable proxy (orange cloud)
3. Configure caching rules
4. Enable Brotli compression

### Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM videos WHERE user_id = '...';
```

---

## Scaling

### Horizontal Scaling (Docker)

```bash
# Scale to 3 instances
docker-compose up -d --scale app=3

# Use nginx for load balancing
# /etc/nginx/nginx.conf
upstream clavier_app {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}
```

### Vercel Auto-Scaling
- Automatic based on traffic
- No configuration needed
- Serverless functions scale independently

---

## Monitoring

### Health Checks

**Endpoint:** `/api/health`

**UptimeRobot Setup:**
1. Add new monitor
2. Type: HTTP(s)
3. URL: `https://your-domain.com/api/health`
4. Interval: 5 minutes
5. Alert contacts: Your email

### Logs

**Vercel:**
```bash
vercel logs --follow
```

**Docker:**
```bash
docker-compose logs -f app
```

### Error Tracking (Sentry)

```bash
# Install
npm install @sentry/nextjs

# Configure
# Add SENTRY_DSN to environment variables
```

---

## Backup & Recovery

### Database Backup (Automated)

**Docker:**
```bash
# Add to crontab
0 2 * * * docker-compose exec -T postgres pg_dump -U clavier clavier > /backups/clavier_$(date +\%Y\%m\%d).sql
```

**Supabase:**
- Automatic backups included
- Point-in-time recovery available
- Manual backups via dashboard

### Application Backup

```bash
# Backup environment
cp .env.production .env.backup

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Backup uploaded files (if using local storage)
tar -czf uploads_backup.tar.gz uploads/
```

---

## Cost Estimation

### Vercel (Hobby Tier - Free)
- 100 GB bandwidth/month
- Unlimited deployments
- 1000 serverless function invocations/day
- **Cost:** $0/month

### Vercel (Pro Tier)
- 1 TB bandwidth/month
- Unlimited everything
- **Cost:** $20/month per user

### Self-Hosted (AWS/DigitalOcean)
- VPS: $10-20/month (2GB RAM)
- Database: $15-25/month (managed PostgreSQL)
- Domain: $10-15/year
- SSL: Free (Let's Encrypt)
- **Total:** ~$30-50/month

### Database Options
- Supabase: Free tier (500MB, 50K queries/month)
- PlanetScale: Free tier (5GB storage, 1B row reads/month)
- Neon: Free tier (3GB storage, unlimited queries)

---

## Support

**Documentation:**
- Full deployment guide: `docs/DEPLOYMENT.md`
- Security policies: `docs/SECURITY.md`
- API reference: `docs/api/`

**Community:**
- GitHub Issues: [Report bugs](https://github.com/yourusername/clavier/issues)
- Discord: [Join community](#)
- Email: support@your-domain.com

---

**Last Updated:** 2025-12-29
