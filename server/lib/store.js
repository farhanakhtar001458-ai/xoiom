import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { DEFAULT_CONTENT } from '../../src/data/defaults.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const clone = (v) => JSON.parse(JSON.stringify(v));

function freshAuth({ email, password }) {
  return {
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString()
  };
}

/**
 * Load the data store. Seeds it from DEFAULT_CONTENT + admin credentials
 * on first run; keeps any existing data/db.json otherwise.
 */
export function loadStore({ email, password }) {
  let db = null;
  try {
    if (fs.existsSync(DB_PATH)) db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (err) {
    console.warn('[xoiom-api] could not read data/db.json, reseeding:', err.message);
  }

  if (!db || typeof db !== 'object') {
    db = {
      profile: clone(DEFAULT_CONTENT.profile),
      skills: clone(DEFAULT_CONTENT.skills),
      projects: clone(DEFAULT_CONTENT.projects),
      journey: clone(DEFAULT_CONTENT.journey),
      messages: []
    };
  }

  // Backfill any missing shape so the API never 500s on old files.
  db.profile =
    db.profile && typeof db.profile === 'object' ? db.profile : clone(DEFAULT_CONTENT.profile);
  if (!db.profile.socials || typeof db.profile.socials !== 'object') {
    db.profile.socials = { github: '', linkedin: '', twitter: '', website: '' };
  }
  if (!Array.isArray(db.profile.about)) db.profile.about = [];
  if (!Array.isArray(db.profile.stats)) db.profile.stats = [];
  db.skills = Array.isArray(db.skills) ? db.skills : [];
  db.projects = Array.isArray(db.projects) ? db.projects : [];
  db.journey = Array.isArray(db.journey) ? db.journey : [];
  db.messages = Array.isArray(db.messages) ? db.messages : [];

  if (!db.auth || typeof db.auth.passwordHash !== 'string') {
    db.auth = freshAuth({ email, password });
  }

  return db;
}

export function saveStore(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}
