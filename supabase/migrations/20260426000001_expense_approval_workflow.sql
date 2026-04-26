-- ============================================================
-- EXPENSE APPROVAL WORKFLOW
-- Adds: MINISTER role, ministries, budget periods, intentions,
--       transfers, settlements, comments, app_settings
-- ============================================================

-- ── New role value ────────────────────────────────────────────
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'MINISTER';

-- ── New enums ─────────────────────────────────────────────────
CREATE TYPE budget_period_status  AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');
CREATE TYPE ministry_budget_status AS ENUM ('DRAFT', 'RELEASED');
CREATE TYPE intention_status      AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE settlement_status     AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE comment_entity        AS ENUM ('INTENTION', 'SETTLEMENT');

-- ── ministries ────────────────────────────────────────────────
CREATE TABLE ministries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── ministry_assignments ──────────────────────────────────────
-- One active assignment per ministry at a time (enforced in app layer).
-- unassigned_at NULL means currently active.
CREATE TABLE ministry_assignments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id    UUID NOT NULL REFERENCES ministries(id),
  user_id        UUID NOT NULL REFERENCES users(id),
  assigned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at  TIMESTAMPTZ,
  assigned_by    UUID REFERENCES users(id),
  notes          TEXT
);

CREATE INDEX idx_ministry_assignments_ministry ON ministry_assignments(ministry_id);
CREATE INDEX idx_ministry_assignments_user     ON ministry_assignments(user_id);

-- ── budget_periods ────────────────────────────────────────────
CREATE TABLE budget_periods (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  status       budget_period_status NOT NULL DEFAULT 'DRAFT',
  released_at  TIMESTAMPTZ,
  released_by  UUID REFERENCES users(id),
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT budget_periods_dates_check CHECK (end_date > start_date)
);

-- ── ministry_budgets ──────────────────────────────────────────
CREATE TABLE ministry_budgets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id  UUID NOT NULL REFERENCES ministries(id),
  period_id    UUID NOT NULL REFERENCES budget_periods(id),
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status       ministry_budget_status NOT NULL DEFAULT 'DRAFT',
  released_by  UUID REFERENCES users(id),
  released_at  TIMESTAMPTZ,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ministry_id, period_id)
);

CREATE INDEX idx_ministry_budgets_period   ON ministry_budgets(period_id);
CREATE INDEX idx_ministry_budgets_ministry ON ministry_budgets(ministry_id);

-- ── budget_intentions ─────────────────────────────────────────
CREATE TABLE budget_intentions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id     UUID NOT NULL REFERENCES ministries(id),
  period_id       UUID NOT NULL REFERENCES budget_periods(id),
  requested_by    UUID NOT NULL REFERENCES users(id),
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description     TEXT NOT NULL,
  purpose         TEXT,
  date_needed     DATE,
  status          intention_status NOT NULL DEFAULT 'PENDING',
  is_over_budget  BOOLEAN NOT NULL DEFAULT false,
  token           UUID NOT NULL DEFAULT gen_random_uuid(),
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  review_message  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_budget_intentions_token    ON budget_intentions(token);
CREATE INDEX        idx_budget_intentions_ministry ON budget_intentions(ministry_id);
CREATE INDEX        idx_budget_intentions_status   ON budget_intentions(status);

-- ── intention_transfers ───────────────────────────────────────
-- Tesorería registers the bank transfer after an intention is approved.
-- One transfer per approved intention.
CREATE TABLE intention_transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intention_id    UUID NOT NULL REFERENCES budget_intentions(id) UNIQUE,
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  transfer_date   DATE NOT NULL,
  reference       TEXT,
  notes           TEXT,
  registered_by   UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── expense_settlements ───────────────────────────────────────
-- Minister submits proof of expense after spending the transferred money.
CREATE TABLE expense_settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intention_id    UUID NOT NULL REFERENCES budget_intentions(id),
  submitted_by    UUID NOT NULL REFERENCES users(id),
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description     TEXT NOT NULL,
  expense_date    DATE NOT NULL,
  is_late         BOOLEAN NOT NULL DEFAULT false,
  attachment_url  TEXT,
  status          settlement_status NOT NULL DEFAULT 'PENDING',
  token           UUID NOT NULL DEFAULT gen_random_uuid(),
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  review_message  TEXT,
  movement_id     UUID REFERENCES movements(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_expense_settlements_token     ON expense_settlements(token);
CREATE INDEX        idx_expense_settlements_intention ON expense_settlements(intention_id);
CREATE INDEX        idx_expense_settlements_status    ON expense_settlements(status);

-- ── request_comments ──────────────────────────────────────────
CREATE TABLE request_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  comment_entity NOT NULL,
  entity_id    UUID NOT NULL,
  user_id      UUID NOT NULL REFERENCES users(id),
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_comments_entity ON request_comments(entity_type, entity_id);

-- ── app_settings ──────────────────────────────────────────────
CREATE TABLE app_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO app_settings (key, value) VALUES
  ('tesoreria_notification_email', ''),
  ('voucher_email', ''),
  ('reminder_interval_days', '2'),
  ('budget_period_start_month', '5');

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE ministries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_budgets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_intentions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE intention_transfers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_settlements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings         ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by admin client in app).
-- These policies cover direct anon/authenticated access as a safety net.

CREATE POLICY "service_role_bypass" ON ministries           USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON ministry_assignments USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON budget_periods       USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON ministry_budgets     USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON budget_intentions    USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON intention_transfers  USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON expense_settlements  USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON request_comments     USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON app_settings         USING (auth.role() = 'service_role');

-- ── Computed column: used_amount per ministry budget ──────────
-- Helper RPC to get remaining budget for a ministry in a period
CREATE OR REPLACE FUNCTION get_ministry_budget_summary(
  p_ministry_id UUID,
  p_period_id   UUID
)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_allocated   NUMERIC;
  v_transferred NUMERIC;
  v_remaining   NUMERIC;
BEGIN
  SELECT COALESCE(amount, 0)
  INTO v_allocated
  FROM ministry_budgets
  WHERE ministry_id = p_ministry_id AND period_id = p_period_id AND status = 'RELEASED';

  -- Deduct only from registered transfers (budget decreases on transfer registration)
  SELECT COALESCE(SUM(it.amount), 0)
  INTO v_transferred
  FROM intention_transfers it
  JOIN budget_intentions bi ON bi.id = it.intention_id
  WHERE bi.ministry_id = p_ministry_id
    AND bi.period_id   = p_period_id;

  v_remaining := v_allocated - v_transferred;

  RETURN jsonb_build_object(
    'allocated',   v_allocated,
    'used',        v_transferred,
    'remaining',   v_remaining
  );
END;
$$;
