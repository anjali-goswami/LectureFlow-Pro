import jwt from 'jsonwebtoken';
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { dbStore } from '../config/db.js';

const scrypt = promisify(scryptCallback);

const getSecret = () => process.env.JWT_SECRET || 'lectureflow-dev-secret-change-me';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await dbStore.findUserByUsername(username);
    let passwordMatches = false;
    if (user?.password?.startsWith('scrypt$')) {
      const [, salt, storedHash] = user.password.split('$');
      const candidate = await scrypt(password, salt, 64);
      const expected = Buffer.from(storedHash, 'hex');
      passwordMatches = candidate.length === expected.length && timingSafeEqual(candidate, expected);
    } else {
      // Keep seeded/demo accounts working while new accounts use salted hashes.
      passwordMatches = Boolean(user && user.password === password);
    }
    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    };

    const token = jwt.sign(
      {
        id: safeUser.id,
        username: safeUser.username,
        role: safeUser.role,
        name: safeUser.name
      },
      getSecret(),
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const signup = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const username = String(req.body?.username || '').trim().toLowerCase();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Name, username, and password are required' });
    }
    if (name.length > 100 || email.length > 100) {
      return res.status(400).json({ error: 'Name and email must be 100 characters or fewer' });
    }
    if (username.length < 3 || username.length > 50 || !/^[a-z0-9._-]+$/.test(username)) {
      return res.status(400).json({ error: 'Username must be 3–50 characters and use letters, numbers, dots, underscores, or hyphens' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if (await dbStore.findUserByUsername(username)) {
      return res.status(409).json({ error: 'That username is already taken' });
    }

    const salt = randomBytes(16).toString('hex');
    const hash = await scrypt(password, salt, 64);
    const user = await dbStore.createUser({
      id: `user-${randomUUID()}`,
      username,
      password: `scrypt$${salt}$${hash.toString('hex')}`,
      name,
      email
    });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      getSecret(),
      { expiresIn: '7d' }
    );
    return res.status(201).json({ message: 'Account created', token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'That username is already taken' });
    console.error('[Auth signup] Account creation failed:', err);
    return res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  return res.json({ user: req.user || null });
};
