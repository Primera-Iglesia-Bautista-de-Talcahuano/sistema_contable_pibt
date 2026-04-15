-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERATOR', 'VIEWER');
CREATE TYPE movement_type AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE movement_status AS ENUM ('ACTIVE', 'CANCELLED');
CREATE TYPE pdf_status AS ENUM ('PENDING', 'GENERATED', 'ERROR');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'ERROR');

-- ============================================================
-- TABLES
-- ============================================================

-- App-level user profile linked to auth.users
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'VIEWER',
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Singleton folio counter (atomic increment via RPC)
CREATE TABLE folio_counter (
  id          TEXT PRIMARY KEY DEFAULT 'main',
  last_folio  INTEGER NOT NULL DEFAULT -1,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO folio_counter (id) VALUES ('main');

-- Core financial transaction
CREATE TABLE movements (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio                 INTEGER NOT NULL UNIQUE,
  folio_display         TEXT GENERATED ALWAYS AS (lpad(folio::text, 6, '0')) STORED,
  movement_date         TIMESTAMPTZ NOT NULL,
  movement_type         movement_type NOT NULL,
  amount                NUMERIC(15,2) NOT NULL,
  category              TEXT NOT NULL,
  concept               TEXT NOT NULL,
  reference_person      TEXT,
  received_by           TEXT,
  delivered_by          TEXT,
  beneficiary           TEXT,
  payment_method        TEXT,
  support_number        TEXT,
  notes                 TEXT,
  status                movement_status NOT NULL DEFAULT 'ACTIVE',
  cancellation_reason   TEXT,
  pdf_url               TEXT,
  drive_file_id         TEXT,
  pdf_status            pdf_status NOT NULL DEFAULT 'PENDING',
  pdf_error             TEXT,
  synced_to_sheet       BOOLEAN NOT NULL DEFAULT false,
  sync_error            TEXT,
  notification_status   notification_status NOT NULL DEFAULT 'PENDING',
  notification_sent_at  TIMESTAMPTZ,
  notification_error    TEXT,
  created_by_id         UUID NOT NULL REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by_id         UUID REFERENCES users(id),
  updated_at            TIMESTAMPTZ,
  cancelled_by_id       UUID REFERENCES users(id),
  cancelled_at          TIMESTAMPTZ
);

-- Per-movement audit trail
CREATE TABLE movement_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id     UUID NOT NULL REFERENCES movements(id) ON DELETE RESTRICT,
  action          TEXT NOT NULL,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  event_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  previous_value  JSONB,
  new_value       JSONB,
  note            TEXT
);

-- System-level audit trail (user/config changes)
CREATE TABLE system_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity          TEXT NOT NULL,
  action          TEXT NOT NULL,
  entity_id       TEXT,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  event_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  previous_value  JSONB,
  new_value       JSONB,
  note            TEXT
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_movements_date        ON movements(movement_date);
CREATE INDEX idx_movements_type        ON movements(movement_type);
CREATE INDEX idx_movements_status      ON movements(status);
CREATE INDEX idx_movements_category    ON movements(category);
CREATE INDEX idx_movements_created_by  ON movements(created_by_id);
CREATE INDEX idx_movements_created_at  ON movements(created_at);

CREATE INDEX idx_mvt_audit_movement    ON movement_audit_log(movement_id);
CREATE INDEX idx_mvt_audit_user        ON movement_audit_log(user_id);
CREATE INDEX idx_mvt_audit_date        ON movement_audit_log(event_date);

CREATE INDEX idx_sys_audit_user        ON system_audit_log(user_id);
CREATE INDEX idx_sys_audit_date        ON system_audit_log(event_date);
CREATE INDEX idx_sys_audit_entity      ON system_audit_log(entity);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Atomic folio increment — called via supabase.rpc('increment_and_get_folio')
CREATE OR REPLACE FUNCTION increment_and_get_folio()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_folio INTEGER;
BEGIN
  UPDATE folio_counter
    SET last_folio = last_folio + 1, updated_at = NOW()
    WHERE id = 'main'
    RETURNING last_folio INTO new_folio;
  RETURN new_folio;
END;
$$;

-- Role lookup used inside RLS policies (avoids per-row joins)
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- users: all authenticated can read; only ADMIN can write
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'ADMIN');
CREATE POLICY "users_update" ON users FOR UPDATE TO authenticated USING (get_my_role() = 'ADMIN');

-- movements: all authenticated can read; ADMIN/OPERATOR can write
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movements_select" ON movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "movements_insert" ON movements FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('ADMIN', 'OPERATOR'));
CREATE POLICY "movements_update" ON movements FOR UPDATE TO authenticated
  USING (get_my_role() IN ('ADMIN', 'OPERATOR'));

-- folio_counter: no direct access — only SECURITY DEFINER functions touch it
ALTER TABLE folio_counter ENABLE ROW LEVEL SECURITY;

-- audit logs: authenticated can read; inserts use service_role key (bypasses RLS)
ALTER TABLE movement_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mvt_audit_select" ON movement_audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "sys_audit_select" ON system_audit_log FOR SELECT TO authenticated USING (true);

-- ============================================================
-- USER MANAGEMENT RPCs
-- ============================================================

-- Bootstrap: creates the first ADMIN — callable only when no users exist.
-- Run once via Supabase Studio: SELECT create_initial_admin('email', 'password', 'Full Name');
CREATE OR REPLACE FUNCTION create_initial_admin(
  p_email      TEXT,
  p_password   TEXT,
  p_full_name  TEXT
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
    RAISE EXCEPTION 'Initial admin already exists. Use create_user_with_role instead.';
  END IF;

  new_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    role, aud, instance_id
  ) VALUES (
    new_id, p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('full_name', p_full_name),
    NOW(), NOW(),
    'authenticated', 'authenticated',
    '00000000-0000-0000-0000-000000000000'
  );

  INSERT INTO users (id, full_name, email, role, active)
  VALUES (new_id, p_full_name, p_email, 'ADMIN', true);

  RETURN new_id;
END;
$$;

-- Ongoing user creation — ADMIN-only, called from the API via service_role client.
CREATE OR REPLACE FUNCTION create_user_with_role(
  p_email      TEXT,
  p_password   TEXT,
  p_full_name  TEXT,
  p_role       user_role DEFAULT 'VIEWER'
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_id UUID;
BEGIN
  IF get_my_role() != 'ADMIN' THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  new_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    role, aud, instance_id
  ) VALUES (
    new_id, p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('full_name', p_full_name),
    NOW(), NOW(),
    'authenticated', 'authenticated',
    '00000000-0000-0000-0000-000000000000'
  );

  INSERT INTO users (id, full_name, email, role, active)
  VALUES (new_id, p_full_name, p_email, p_role, true);

  RETURN new_id;
END;
$$;
