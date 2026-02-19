/**
 * Shared authentication middleware & helpers.
 * Eliminates the duplicated getUserIdFromAuth() across route files.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Warn loudly if using default secret in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'dev-secret-change-me') {
  console.error('🚨 CRITICAL: JWT_SECRET is using the default value in production!');
  console.error('   Set a strong JWT_SECRET environment variable before deploying.');
  process.exit(1);
}

/**
 * Extract user ID from Bearer token. Returns null if invalid/missing.
 */
function getUserIdFromAuth(req) {
  const auth = (req.headers.authorization || '').replace('Bearer ', '');
  if (!auth) return null;
  try {
    const payload = jwt.verify(auth, JWT_SECRET);
    return payload.sub;
  } catch (e) {
    return null;
  }
}

/**
 * Express middleware — rejects with 401 if no valid token.
 * Attaches req.userId on success.
 */
function requireAuth(req, res, next) {
  const userId = getUserIdFromAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
}

module.exports = { getUserIdFromAuth, requireAuth, signToken, JWT_SECRET };
