import { NextApiRequest } from 'next';
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; reset: number }>();

/**
 * Core rate limiting logic
 */
function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();

  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.reset < now) {
      rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(identifier);

  if (!current || current.reset < now) {
    // New window
    const reset = now + config.interval;
    rateLimitStore.set(identifier, { count: 1, reset });

    return {
      allowed: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset,
    };
  }

  // Increment count
  current.count++;
  rateLimitStore.set(identifier, current);

  const allowed = current.count <= config.uniqueTokenPerInterval;
  const remaining = Math.max(0, config.uniqueTokenPerInterval - current.count);

  return {
    allowed,
    limit: config.uniqueTokenPerInterval,
    remaining,
    reset: current.reset,
  };
}

/**
 * Rate limiting implementation using in-memory store (Pages Router)
 * For production, replace with Redis or Upstash
 */
export async function rateLimit(
  request: NextApiRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100, // 100 requests per minute
  }
): Promise<RateLimitResult> {
  const identifier = getIdentifier(request);
  return checkRateLimit(identifier, config);
}

/**
 * Rate limiting for App Router (NextRequest)
 */
export async function rateLimitApp(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100, // 100 requests per minute
  }
): Promise<RateLimitResult> {
  const identifier = getIdentifierApp(request);
  return checkRateLimit(identifier, config);
}

/**
 * Get unique identifier for rate limiting (Pages Router)
 * Priority: API key > User ID > IP address
 */
function getIdentifier(request: NextApiRequest): string {
  // Check for API key in headers
  const apiKey = request.headers['x-api-key'];
  if (apiKey && typeof apiKey === 'string') {
    return `api:${apiKey}`;
  }

  // Check for authenticated user (from session)
  // @ts-ignore - session might be added by NextAuth
  const userId = request.session?.user?.id;
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : request.socket.remoteAddress || 'unknown';

  return `ip:${ip}`;
}

/**
 * Get unique identifier for rate limiting (App Router)
 * Priority: API key > IP address
 */
function getIdentifierApp(request: NextRequest): string {
  // Check for API key in headers
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    return `api:${apiKey}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown';

  return `ip:${ip}`;
}

/**
 * Create rate limit error response for App Router
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  return response;
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  handler: (req: NextApiRequest, res: any) => Promise<any>,
  config?: RateLimitConfig
) {
  return async (req: NextApiRequest, res: any) => {
    const result = await rateLimit(req, config);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', result.reset.toString());

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());

      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter,
      });
    }

    return handler(req, res);
  };
}

/**
 * Redis-based rate limiting (for production)
 * Requires @upstash/redis package
 */
export async function rateLimitRedis(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;

  if (!redisUrl || !redisToken) {
    throw new Error('Redis configuration missing. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.');
  }

  // Lazy load Redis to avoid errors when not configured
  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({ url: redisUrl, token: redisToken });

  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const window = config.interval;
  const limit = config.uniqueTokenPerInterval;

  // Use Redis pipeline for atomic operations
  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.pexpire(key, window);

  const results = await pipeline.exec();
  const count = results[0] as number;

  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  const reset = now + window;

  return {
    allowed,
    limit,
    remaining,
    reset,
  };
}

/**
 * Example usage in API route:
 *
 * import { withRateLimit } from '@/lib/rate-limit';
 *
 * async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   // Your API logic here
 *   res.status(200).json({ success: true });
 * }
 *
 * export default withRateLimit(handler, {
 *   interval: 60 * 1000, // 1 minute
 *   uniqueTokenPerInterval: 10, // 10 requests per minute
 * });
 */
