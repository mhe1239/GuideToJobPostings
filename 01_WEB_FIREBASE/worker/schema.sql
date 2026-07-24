CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  source TEXT NOT NULL DEFAULT 'cloudflare-d1',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  approval_status TEXT NOT NULL DEFAULT 'draft',
  notice_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notices_approval_status ON notices(approval_status);
CREATE INDEX IF NOT EXISTS idx_notices_updated_at ON notices(updated_at);
