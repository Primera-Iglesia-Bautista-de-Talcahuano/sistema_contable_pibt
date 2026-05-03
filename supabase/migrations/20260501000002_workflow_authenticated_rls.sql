-- ============================================================
-- Add explicit `authenticated` RLS policies to workflow tables.
-- Until now these tables only had a `service_role` bypass policy, leaving the
-- authenticated role with default-deny — fine functionally (the app uses the
-- admin client server-side), but it removes the defense-in-depth that RLS is
-- supposed to provide. With these policies, an accidental SSR client query, a
-- future realtime subscription, or a bug exposing the wrong row to the wrong
-- user is caught at the database boundary.
--
-- Decided scope (from review plan):
--   • ADMIN / FINANCE  → read all org-wide
--   • BURSAR            → read all (bookkeeping role; needs full visibility)
--   • MINISTER          → read intentions/settlements they own OR for ministries
--                         they are currently assigned to
-- Writes mirror the app-layer permission table:
--   • Reference data (ministries, periods, budgets, app_settings)  → ADMIN only
--   • intentions / settlements                                      → MINISTER
--                       creates rows for self; ADMIN/FINANCE update for review
--   • transfers                                                     → ADMIN/FINANCE
--   • request_comments                                              → any auth user
--                       on their own row (user_id = auth.uid())
-- ============================================================

-- ── helper: ministries the calling user is currently assigned to ──
-- SECURITY DEFINER so it sees ministry_assignments through the owner
-- (avoids recursion through that table's own RLS once we lock it down).
CREATE OR REPLACE FUNCTION get_my_active_ministries()
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT ministry_id
  FROM ministry_assignments
  WHERE user_id = auth.uid()
    AND unassigned_at IS NULL
$$;

-- ============================================================
-- ministries — reference data, all roles can read, ADMIN writes
-- ============================================================
CREATE POLICY "ministries_select" ON ministries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "ministries_insert" ON ministries
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'ADMIN');

CREATE POLICY "ministries_update" ON ministries
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'ADMIN')
  WITH CHECK (get_my_role() = 'ADMIN');

-- ============================================================
-- ministry_assignments — visible to all auth, mutated by ADMIN
-- ============================================================
CREATE POLICY "ministry_assignments_select" ON ministry_assignments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "ministry_assignments_insert" ON ministry_assignments
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'ADMIN');

CREATE POLICY "ministry_assignments_update" ON ministry_assignments
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'ADMIN')
  WITH CHECK (get_my_role() = 'ADMIN');

CREATE POLICY "ministry_assignments_delete" ON ministry_assignments
  FOR DELETE TO authenticated
  USING (get_my_role() = 'ADMIN');

-- ============================================================
-- budget_periods — visible to all, ADMIN-managed
-- ============================================================
CREATE POLICY "budget_periods_select" ON budget_periods
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "budget_periods_insert" ON budget_periods
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'ADMIN');

CREATE POLICY "budget_periods_update" ON budget_periods
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'ADMIN')
  WITH CHECK (get_my_role() = 'ADMIN');

-- ============================================================
-- ministry_budgets — visible to all (ministers see their remaining), ADMIN writes
-- ============================================================
CREATE POLICY "ministry_budgets_select" ON ministry_budgets
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "ministry_budgets_insert" ON ministry_budgets
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'ADMIN');

CREATE POLICY "ministry_budgets_update" ON ministry_budgets
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'ADMIN')
  WITH CHECK (get_my_role() = 'ADMIN');

-- ============================================================
-- budget_intentions — scoped reads, role-gated writes
-- ============================================================
CREATE POLICY "budget_intentions_select" ON budget_intentions
  FOR SELECT TO authenticated
  USING (
    get_my_role() IN ('ADMIN', 'FINANCE', 'BURSAR')
    OR requested_by = auth.uid()
    OR ministry_id IN (SELECT get_my_active_ministries())
  );

CREATE POLICY "budget_intentions_insert" ON budget_intentions
  FOR INSERT TO authenticated
  WITH CHECK (
    get_my_role() = 'ADMIN'
    OR (get_my_role() = 'MINISTER' AND requested_by = auth.uid())
  );

CREATE POLICY "budget_intentions_update" ON budget_intentions
  FOR UPDATE TO authenticated
  USING (get_my_role() IN ('ADMIN', 'FINANCE'))
  WITH CHECK (get_my_role() IN ('ADMIN', 'FINANCE'));

-- ============================================================
-- intention_transfers — visible to all auth, ADMIN/FINANCE mutate
-- ============================================================
CREATE POLICY "intention_transfers_select" ON intention_transfers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "intention_transfers_insert" ON intention_transfers
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('ADMIN', 'FINANCE'));

CREATE POLICY "intention_transfers_update" ON intention_transfers
  FOR UPDATE TO authenticated
  USING (get_my_role() IN ('ADMIN', 'FINANCE'))
  WITH CHECK (get_my_role() IN ('ADMIN', 'FINANCE'));

-- ============================================================
-- expense_settlements — same scoping pattern as intentions
-- ============================================================
CREATE POLICY "expense_settlements_select" ON expense_settlements
  FOR SELECT TO authenticated
  USING (
    get_my_role() IN ('ADMIN', 'FINANCE', 'BURSAR')
    OR submitted_by = auth.uid()
    OR intention_id IN (
      SELECT id FROM budget_intentions
      WHERE ministry_id IN (SELECT get_my_active_ministries())
    )
  );

CREATE POLICY "expense_settlements_insert" ON expense_settlements
  FOR INSERT TO authenticated
  WITH CHECK (
    get_my_role() = 'ADMIN'
    OR (get_my_role() = 'MINISTER' AND submitted_by = auth.uid())
  );

CREATE POLICY "expense_settlements_update" ON expense_settlements
  FOR UPDATE TO authenticated
  USING (get_my_role() IN ('ADMIN', 'FINANCE'))
  WITH CHECK (get_my_role() IN ('ADMIN', 'FINANCE'));

-- ============================================================
-- request_comments — anyone can read; users post their own
-- ============================================================
CREATE POLICY "request_comments_select" ON request_comments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "request_comments_insert" ON request_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- app_settings — readable, ADMIN writes
-- ============================================================
CREATE POLICY "app_settings_select" ON app_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "app_settings_insert" ON app_settings
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'ADMIN');

CREATE POLICY "app_settings_update" ON app_settings
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'ADMIN')
  WITH CHECK (get_my_role() = 'ADMIN');
