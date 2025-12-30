# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

### 1. Environment Variables

**Never commit secrets to version control:**

```bash
# Add to .gitignore
.env
.env.local
.env.production
.env.*.local
```

**Required environment variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret (generate with `openssl rand -base64 32`)
- `ANTHROPIC_API_KEY` - Claude API key
- TTS provider keys (Google, Azure, or ElevenLabs)

**Generate secure secrets:**

```bash
# NextAuth secret
openssl rand -base64 32

# API key
openssl rand -hex 32
```

### 2. Authentication & Authorization

**NextAuth.js Configuration:**

- Session strategy: JWT with HTTP-only cookies
- CSRF protection enabled by default
- Secure session cookies in production

**API Route Protection:**

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Protected logic here
}
```

### 3. Rate Limiting

**Implemented in:** `/src/lib/rate-limit.ts`

**Default limits:**
- 100 requests per minute per IP
- 500 requests per minute per authenticated user
- 1000 requests per minute per API key

**Usage:**

```typescript
import { withRateLimit } from '@/lib/rate-limit';

export default withRateLimit(handler, {
  interval: 60 * 1000,
  uniqueTokenPerInterval: 10,
});
```

### 4. CORS Configuration

**Allowed origins:**

```javascript
// vercel.json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      {
        "key": "Access-Control-Allow-Origin",
        "value": "https://your-domain.com"
      }
    ]
  }
]
```

**Dynamic CORS (for multiple domains):**

```typescript
// middleware.ts
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
if (origin && allowedOrigins.includes(origin)) {
  response.headers.set('Access-Control-Allow-Origin', origin);
}
```

### 5. Content Security Policy (CSP)

**Configured in:** `middleware.ts` and `vercel.json`

**Key directives:**

```
default-src 'self'
script-src 'self' 'unsafe-eval' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
connect-src 'self' https://api.anthropic.com
frame-ancestors 'none'
```

### 6. SQL Injection Prevention

**Using Prisma ORM:**

- Parameterized queries by default
- Type-safe database access
- No raw SQL unless necessary

**Raw queries (when needed):**

```typescript
// ✅ Safe - parameterized
await prisma.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`;

// ❌ Unsafe - never concatenate
await prisma.$queryRawUnsafe(`
  SELECT * FROM users WHERE id = ${userId}
`);
```

### 7. XSS Prevention

**Next.js protections:**

- Automatic HTML escaping in JSX
- Sanitized user input in components

**Manual sanitization (when needed):**

```typescript
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(userInput);
```

**Avoid `dangerouslySetInnerHTML`:**

```typescript
// ❌ Unsafe
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe - sanitize first
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 8. Dependency Security

**Automated scanning:**

```bash
# npm audit
npm audit --audit-level=moderate

# Fix automatically
npm audit fix

# Trivy scan (in CI/CD)
trivy fs --severity HIGH,CRITICAL .
```

**Dependabot configuration:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### 9. HTTPS/TLS

**Vercel:** Automatic HTTPS with SSL certificates

**Self-hosted:**

```bash
# Let's Encrypt with Certbot
sudo certbot --nginx -d your-domain.com
```

**Force HTTPS redirect:**

```javascript
// next.config.js
async redirects() {
  return [
    {
      source: '/:path*',
      has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
      destination: 'https://your-domain.com/:path*',
      permanent: true,
    },
  ];
}
```

### 10. Logging & Monitoring

**What to log:**

- Authentication attempts (success/failure)
- API errors and exceptions
- Rate limit violations
- Database connection issues

**What NOT to log:**

- Passwords or secrets
- Full credit card numbers
- Personal identifiable information (PII)
- API keys or tokens

**Structured logging:**

```typescript
const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta }));
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta,
    }));
  },
};
```

## Reporting a Vulnerability

**Do NOT open a public issue for security vulnerabilities.**

**Instead:**

1. Email: security@your-domain.com
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

**Response timeline:**

- Initial response: Within 48 hours
- Status update: Within 7 days
- Fix timeline: Based on severity

**Severity levels:**

| Level    | Response Time | Fix Timeline |
|----------|---------------|--------------|
| Critical | 24 hours      | 1-3 days     |
| High     | 48 hours      | 3-7 days     |
| Medium   | 7 days        | 14-30 days   |
| Low      | 14 days       | 30-60 days   |

## Security Checklist

### Development

- [ ] No hardcoded secrets in code
- [ ] All dependencies up to date
- [ ] No console.log with sensitive data
- [ ] Input validation on all user inputs
- [ ] Error messages don't expose internal details

### Deployment

- [ ] Environment variables properly set
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Database credentials rotated
- [ ] Monitoring and alerting configured

### Maintenance

- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Regular backup verification
- [ ] Incident response plan updated

## Security Tools

**Recommended tools:**

1. **Snyk** - Dependency vulnerability scanning
2. **SonarQube** - Code quality and security
3. **OWASP ZAP** - Web application security testing
4. **Trivy** - Container vulnerability scanning
5. **Git-secrets** - Prevent committing secrets

## Compliance

**Standards followed:**

- OWASP Top 10
- CWE Top 25
- GDPR (data protection)
- SOC 2 (for enterprise)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/database/security)

---

**Last Updated:** 2025-12-29
**Version:** 1.0.0
