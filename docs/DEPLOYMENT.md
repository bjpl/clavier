# Clavier Production Deployment Guide

## Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Options](#deployment-options)
  - [Option 1: Vercel (Recommended)](#option-1-vercel-recommended)
  - [Option 2: Docker](#option-2-docker)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Security Hardening](#security-hardening)
- [Performance Optimization](#performance-optimization)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Test coverage ≥ 80%
- [ ] Bundle size within limits (<500KB per chunk)

### Security
- [ ] No secrets in codebase
- [ ] All dependencies updated
- [ ] Security audit passed (`npm audit`)
- [ ] CORS configuration verified
- [ ] CSP headers configured
- [ ] Rate limiting enabled

### Infrastructure
- [ ] Database backup strategy in place
- [ ] Monitoring tools configured
- [ ] Error tracking enabled
- [ ] CDN configured (if applicable)
- [ ] SSL certificates valid

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment runbook reviewed

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Advantages:**
- Zero-config deployment
- Automatic HTTPS
- Edge network CDN
- Serverless functions
- Preview deployments
- Built-in analytics

#### Initial Setup

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Link Project:**
```bash
vercel link
```

4. **Configure Environment Variables:**
```bash
# Add environment variables via Vercel dashboard or CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add ANTHROPIC_API_KEY production
# ... add all required variables from .env.production.example
```

5. **Deploy:**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Automated Deployments

GitHub Actions automatically deploys on push to `main` branch.

**Setup GitHub Secrets:**
1. Go to repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `VERCEL_TOKEN` - From Vercel account settings
   - `VERCEL_ORG_ID` - From `.vercel/project.json`
   - `VERCEL_PROJECT_ID` - From `.vercel/project.json`
   - All environment variables from `.env.production.example`

**Manual Deployment:**
```bash
# Trigger deployment workflow manually
gh workflow run deploy.yml
```

---

### Option 2: Docker

**Advantages:**
- Full control over infrastructure
- Self-hosted option
- Consistent environments
- Multi-service orchestration

#### Prerequisites

- Docker 24.0+
- Docker Compose 2.0+
- PostgreSQL 16 (or use docker-compose)

#### Setup

1. **Clone Repository:**
```bash
git clone https://github.com/yourusername/clavier.git
cd clavier
```

2. **Configure Environment:**
```bash
cp .env.production.example .env.production
# Edit .env.production with your values
nano .env.production
```

3. **Build Docker Image:**
```bash
docker build -t clavier:latest .
```

4. **Run with Docker Compose:**
```bash
docker-compose up -d
```

5. **Run Database Migrations:**
```bash
docker-compose exec app npx prisma migrate deploy
```

6. **Verify Deployment:**
```bash
curl http://localhost:3000/api/health
```

#### Docker Commands

```bash
# View logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Scale application
docker-compose up -d --scale app=3
```

---

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `https://your-domain.com` |
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-api03-...` |

### TTS Provider Variables (Choose at least one)

**Google Cloud TTS:**
```bash
GOOGLE_TTS_API_KEY=your_google_api_key
```

**Azure Cognitive Services:**
```bash
AZURE_TTS_KEY=your_azure_key
AZURE_TTS_REGION=eastus
```

**ElevenLabs:**
```bash
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Optional Variables

```bash
# Redis caching
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOGROCKET_APP_ID=your_app_id

# Email notifications
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

---

## Database Setup

### Supabase (Recommended for Vercel)

1. **Create Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note connection string

2. **Configure Connection:**
```bash
# Connection pooling URL (for serverless)
DATABASE_URL="postgres://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true"

# Direct connection (for migrations)
DIRECT_URL="postgres://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

3. **Run Migrations:**
```bash
npx prisma migrate deploy
```

### Self-Hosted PostgreSQL

1. **Install PostgreSQL 16:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-16

# macOS
brew install postgresql@16
```

2. **Create Database:**
```sql
CREATE DATABASE clavier;
CREATE USER clavier WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE clavier TO clavier;
```

3. **Configure Connection:**
```bash
DATABASE_URL="postgresql://clavier:your_password@localhost:5432/clavier"
```

### Migration Strategy

**Production Migrations:**
```bash
# 1. Create migration (development)
npx prisma migrate dev --name add_feature

# 2. Review generated SQL
cat prisma/migrations/*/migration.sql

# 3. Test on staging
DATABASE_URL=$STAGING_DB npx prisma migrate deploy

# 4. Deploy to production
DATABASE_URL=$PRODUCTION_DB npx prisma migrate deploy
```

**Backup Before Migration:**
```bash
# PostgreSQL backup
pg_dump -h localhost -U clavier -d clavier > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
psql -h localhost -U clavier -d clavier < backup_20250629_120000.sql
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

**1. CI Pipeline (`.github/workflows/ci.yml`)**
- Runs on every PR and push
- Type checking, linting, testing
- Security scanning
- Build verification

**2. Deploy Pipeline (`.github/workflows/deploy.yml`)**
- Runs on push to `main`
- Deploys to Vercel
- Builds Docker image
- Runs database migrations
- Post-deployment verification

**3. Quality Checks (`.github/workflows/quality-checks.yml`)**
- Weekly scheduled runs
- Dependency audits
- Performance testing
- Bundle size analysis

### Required GitHub Secrets

```bash
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Database
DATABASE_URL
DIRECT_URL

# Authentication
NEXTAUTH_SECRET
NEXTAUTH_URL

# API Keys
ANTHROPIC_API_KEY
GOOGLE_TTS_API_KEY
AZURE_TTS_KEY
AZURE_TTS_REGION

# Monitoring (optional)
SENTRY_DSN
SLACK_WEBHOOK

# Production URL for health checks
PRODUCTION_URL
```

---

## Monitoring & Logging

### Error Tracking (Sentry)

1. **Install:**
```bash
npm install @sentry/nextjs
```

2. **Configure:**
```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

3. **Monitor:**
- Dashboard: https://sentry.io
- Alerts: Configure email/Slack notifications

### Application Monitoring (LogRocket)

```javascript
// _app.tsx
import LogRocket from 'logrocket';

if (process.env.NODE_ENV === 'production') {
  LogRocket.init(process.env.LOGROCKET_APP_ID);
}
```

### Health Checks

**Endpoint:** `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-29T...",
  "services": {
    "database": "up",
    "redis": "up",
    "anthropic": "up"
  }
}
```

**Monitoring:**
```bash
# UptimeRobot, Pingdom, or custom script
curl -f https://your-domain.com/api/health || notify-admin
```

---

## Security Hardening

### HTTPS/SSL

**Vercel:** Automatic HTTPS

**Docker/Self-Hosted:**
```bash
# Use Certbot for Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

### Security Headers

Configured in `vercel.json` and Next.js middleware:

```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
});

export async function rateLimit(identifier: string) {
  const key = `rate_limit:${identifier}`;
  const limit = 100; // requests
  const window = 15 * 60; // 15 minutes

  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, window);
  }

  return current <= limit;
}
```

### Secrets Management

**Never commit secrets:**
```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

**Use environment variables:**
- Vercel: Project Settings → Environment Variables
- Docker: `.env.production` file (excluded from git)
- CI/CD: GitHub Secrets

---

## Performance Optimization

### Caching Strategy

**1. Static Assets (Next.js):**
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  headers: async () => [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};
```

**2. API Response Caching (Redis):**
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({ url: process.env.REDIS_URL });

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return cached as T;

  const data = await fetcher();
  await redis.setex(key, ttl, data);
  return data;
}
```

### Database Optimization

**Connection Pooling:**
```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")

  // Connection pooling for serverless
  relationMode = "prisma"
}
```

**Indexes:**
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
```

### CDN Configuration

**Vercel Edge Network:**
- Automatic global CDN
- Edge caching
- Image optimization

**Cloudflare (Alternative):**
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

---

## Rollback Procedures

### Vercel Rollback

**Via Dashboard:**
1. Go to Vercel dashboard
2. Select project → Deployments
3. Find previous working deployment
4. Click "..." → Promote to Production

**Via CLI:**
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel alias set <deployment-url> production
```

### Docker Rollback

**1. Tag Previous Version:**
```bash
# Before deploying new version
docker tag clavier:latest clavier:backup-$(date +%Y%m%d)
```

**2. Rollback:**
```bash
# Stop current version
docker-compose down

# Restore previous version
docker tag clavier:backup-20250629 clavier:latest

# Restart
docker-compose up -d
```

### Database Rollback

**1. Restore from Backup:**
```bash
# Restore PostgreSQL backup
psql -h localhost -U clavier -d clavier < backup_20250629_120000.sql
```

**2. Revert Migration:**
```bash
# Reset to specific migration
npx prisma migrate reset

# Or manually run down migration
psql -h localhost -U clavier -d clavier -f prisma/migrations/XXXXXX_down.sql
```

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptom:** Vercel/Docker build fails

**Solutions:**
```bash
# Clear cache and rebuild
npm run clean
rm -rf .next node_modules
npm install
npm run build

# Check for missing environment variables
npm run build 2>&1 | grep "undefined"
```

#### 2. Database Connection Errors

**Symptom:** `Error: P1001: Can't reach database server`

**Solutions:**
```bash
# Test connection
psql $DATABASE_URL

# Check firewall rules
# Ensure database allows connections from deployment IP

# Verify connection pooling
# Use connection pooler URL for serverless (Supabase, PlanetScale)
```

#### 3. API Rate Limiting

**Symptom:** `429 Too Many Requests`

**Solutions:**
```typescript
// Implement exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}
```

#### 4. Memory Issues (Docker)

**Symptom:** Container crashes with OOM

**Solutions:**
```yaml
# docker-compose.yml - Increase memory limits
services:
  app:
    deploy:
      resources:
        limits:
          memory: 4G
```

### Health Check Endpoint

```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, string>,
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.services.database = 'up';
  } catch (error) {
    checks.services.database = 'down';
    checks.status = 'unhealthy';
  }

  // Add more service checks...

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(checks);
}
```

### Logs

**Vercel:**
```bash
# View logs
vercel logs production

# Stream logs
vercel logs --follow
```

**Docker:**
```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f postgres

# All services
docker-compose logs -f
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to First Byte (TTFB) | < 200ms | Lighthouse |
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| API Response Time (p95) | < 500ms | Monitoring |
| Database Query Time (p95) | < 100ms | Logs |

### Monitoring

```bash
# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage

# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 https://your-domain.com
```

---

## Support & Maintenance

### Update Schedule

- **Dependencies:** Weekly
- **Security patches:** Immediately
- **Feature releases:** Bi-weekly
- **Database backups:** Daily

### Maintenance Windows

- **Preferred time:** Sunday 2-4 AM UTC
- **Notification:** 48 hours advance
- **Status page:** https://status.your-domain.com

### Contact

- **Technical issues:** support@your-domain.com
- **Security concerns:** security@your-domain.com
- **Emergency hotline:** Available in internal docs

---

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Platform Docs](https://vercel.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Last Updated:** 2025-12-29
**Version:** 1.0.0
**Maintained by:** Clavier Development Team
