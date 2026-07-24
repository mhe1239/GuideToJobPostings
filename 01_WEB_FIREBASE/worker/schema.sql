CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  source TEXT NOT NULL DEFAULT 'cloudflare-d1',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
