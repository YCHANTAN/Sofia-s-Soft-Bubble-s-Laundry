import { rateLimit } from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Increased for testing: 100 attempts per 15 minutes
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
