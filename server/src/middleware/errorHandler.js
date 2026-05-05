import { config } from '../config/index.js';
import AppError from '../utils/AppError.js';

// Patterns that should never leak to clients — SQL keywords, stack frames, file paths
const SENSITIVE_PATTERNS = [
  /\bSELECT\b/gi,
  /\bINSERT\b/gi,
  /\bUPDATE\b/gi,
  /\bDELETE\b/gi,
  /\bFROM\b/gi,
  /\bWHERE\b/gi,
  /\bJOIN\b/gi,
  /\bTABLE\b/gi,
  /\bDATABASE\b/gi,
  /\S+\.(js|ts)(:\d+)?/gi,
  /\bat\s+(Object\.|async\s+)?/gi,
  /:\d+:\d+/g,
];

function containsSensitiveInfo(message) {
  return SENSITIVE_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(message);
  });
}

function sanitiseMessage(message) {
  let sanitised = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.lastIndex = 0;
    sanitised = sanitised.replace(pattern, '[redacted]');
  }
  return sanitised;
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (config.nodeEnv === 'development') {
    console.error('[ErrorHandler]', err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  if (config.nodeEnv !== 'development') {
    console.error('[ErrorHandler] Unexpected error:', err);
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      details: [],
    },
  });
};

export { containsSensitiveInfo, sanitiseMessage };
export default errorHandler;
