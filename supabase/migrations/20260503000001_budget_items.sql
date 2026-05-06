-- ============================================================
-- Budget line items and their optional allocation breakdowns.
--
-- budget_items: individual line items within a budget period,
--   optionally assigned to a ministry (nullable = general expense).
-- budget_item_allocations: optional sub-items that distribute
--   a parent item's amount across ministries/areas, expressed as
--   fixed amounts (AMOUNT) or percentages (PERCENTAGE).
-- ============================================================

-- ── budget_items ──────────────────────────────────────────────
CREATE TABLE budget_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id   UUID        NOT NULL REFERENCES budget_periods(id) ON DELETE CASCADE,
  ministry_id UUID        REFERENCES ministries(id),
  description TEXT        NOT NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  notes       TEXT,
  created_by  UUID        REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_bypass" ON budget_items USING (auth.role() = 'service_role');

CREATE POLICY "budget_items_select" ON budget_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "budget_items_insert" ON budget_items
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('ADMIN', 'BURSAR', 'FINANCE'));

CREATE POLICY "budget_items_update" ON budget_items
  FOR UPDATE TO authenticated
  USING  (get_my_role() IN ('ADMIN', 'BURSAR', 'FINANCE'))
  WITH CHECK (get_my_role() IN ('ADMIN', 'BURSAR', 'FINANCE'));

CREATE POLICY "budget_items_delete" ON budget_items
  FOR DELETE TO authenticated
  USING (get_my_role() IN ('ADMIN', 'BURSAR', 'FINANCE'));

-- ── budget_item_allocations ───────────────────────────────────
CREATE TABLE budget_item_allocations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID        NOT NULL REFERENCES budget_items(id) ON DELETE CASCADE,
  ministry_id     UUID        REFERENCES ministries(id),
  description     TEXT,
  -- 'AMOUNT' = fixed CLP value; 'PERCENTAGE' = % of parent item amount
  allocation_type TEXT        NOT NULL CHECK (allocation_type IN ('AMOUNT', 'PERCENTAGE')),
  value           NUMERIC(12,4) NOT NULL CHECK (value > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE budget_item_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_bypass" ON budget_item_allocations USING (auth.role() = 'service_role');

CREATE POLICY "budget_item_allocations_select" ON budget_item_allocations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "budget_item_allocations_insert" ON budget_item_allocations
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('ADMIN', 'BURSAR', 'FINANCE'));

CREATE POLICY "budget_item_allocations_update" ON budget_item_allocations
  FOR UPDATE TO authenticated
  USING  (get_my_role() IN ('ADMIN', 'BURSAR', 'FINANCE'))
  WITH CHECK (get_my_role() IN ('ADMIN', 'BURSAR', 'FINANCE'));

CREATE POLICY "budget_item_allocations_delete" ON budget_item_allocations
  FOR DELETE TO authenticated
  USING (get_my_role() IN ('ADMIN', 'BURSAR', 'FINANCE'));
