-- ============================================================
-- Lock down SECURITY DEFINER functions: revoke EXECUTE from PUBLIC
-- and grant only to the roles that legitimately call each one.
--
-- Postgres grants EXECUTE to PUBLIC by default. Combined with
-- SECURITY DEFINER (which runs the body as the function owner —
-- typically a superuser), this lets any authenticated or anon
-- session call sensitive helpers regardless of RLS.
--
-- create_user_with_role already has an internal `IF get_my_role()
-- != 'ADMIN' THEN RAISE` check, but that only fires for callers
-- with a session — relying on it as the sole gate is fragile.
-- The intent across the app is: the admin client (service_role)
-- is the only legitimate caller; RLS helpers are the exception
-- since they have to be reachable from authenticated policies.
-- ============================================================

-- Helpers used inside RLS policies must remain callable by authenticated.
REVOKE EXECUTE ON FUNCTION get_my_role()                                  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_my_active_ministries()                     FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_my_role()                                  TO authenticated;
GRANT  EXECUTE ON FUNCTION get_my_active_ministries()                     TO authenticated;

-- Privileged ops — admin client only. service_role bypasses RLS but still
-- needs an explicit EXECUTE grant on functions that have been REVOKEd from PUBLIC.
REVOKE EXECUTE ON FUNCTION increment_and_get_folio()                      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_dashboard_summary(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_ministry_budget_summary(UUID, UUID)         FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION create_user_with_role(TEXT, TEXT, TEXT, user_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION create_initial_admin(TEXT, TEXT, TEXT)          FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_pending_reminders()                         FROM PUBLIC;

GRANT EXECUTE ON FUNCTION increment_and_get_folio()                       TO service_role;
GRANT EXECUTE ON FUNCTION get_dashboard_summary(TIMESTAMPTZ, TIMESTAMPTZ)  TO service_role;
GRANT EXECUTE ON FUNCTION get_ministry_budget_summary(UUID, UUID)          TO service_role;
GRANT EXECUTE ON FUNCTION create_user_with_role(TEXT, TEXT, TEXT, user_role) TO service_role;
GRANT EXECUTE ON FUNCTION create_initial_admin(TEXT, TEXT, TEXT)           TO service_role;
GRANT EXECUTE ON FUNCTION get_pending_reminders()                          TO service_role;
