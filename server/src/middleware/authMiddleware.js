import jwt from 'jsonwebtoken';

const getSecret = () => process.env.JWT_SECRET || 'lectureflow-dev-secret-change-me';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, getSecret());
    req.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      name: payload.name
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  return next();
}