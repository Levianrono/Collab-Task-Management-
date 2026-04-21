-- ============================================================
-- Collaborative Task Management — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor)
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,                          -- NULL for OAuth-only users
  full_name     TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── TEAMS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── TEAM MEMBERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')) DEFAULT 'editor',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (team_id, user_id)
);

-- ─── TASKS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  team_id     UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  status      TEXT NOT NULL CHECK (status IN ('todo','in_progress','done')) DEFAULT 'todo',
  priority    TEXT NOT NULL CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
  deadline    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── COMMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  content        TEXT NOT NULL,
  attachment_url TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('task_assigned','task_updated','comment_added','deadline_reminder','mention')),
  message         TEXT,
  is_read         BOOLEAN DEFAULT false,
  related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_team      ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee  ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status    ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_comments_task   ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_notifs_user     ON notifications(user_id, is_read);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Enable RLS on all tables (the backend uses service role to bypass where needed)
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams          ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "users_read_own"   ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- Team members can read teams they belong to
CREATE POLICY "teams_member_read" ON teams FOR SELECT
  USING (id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

-- Team members can see other members in their teams
CREATE POLICY "team_members_read" ON team_members FOR SELECT
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

-- Tasks: readable by team members
CREATE POLICY "tasks_team_read" ON tasks FOR SELECT
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

-- Comments: readable if user can see the task
CREATE POLICY "comments_task_read" ON comments FOR SELECT
  USING (task_id IN (
    SELECT id FROM tasks WHERE team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  ));

-- Notifications: users can only read their own
CREATE POLICY "notifs_own" ON notifications FOR SELECT USING (user_id = auth.uid());

-- ─── REALTIME PUBLICATIONS ───────────────────────────────────
-- Enable Realtime for live comments and notifications
-- Run in Supabase Dashboard: Database → Replication → enable for these tables
-- Or uncomment below (requires Supabase CLI / superuser):
-- ALTER PUBLICATION supabase_realtime ADD TABLE comments;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
