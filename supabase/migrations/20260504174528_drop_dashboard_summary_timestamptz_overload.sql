-- Drop the TIMESTAMPTZ overload of get_dashboard_summary that was left behind
-- when 20260502000001 replaced it with a DATE variant via CREATE OR REPLACE.
-- PostgREST cannot resolve ambiguous overloads, so callers get PGRST203.

DROP FUNCTION IF EXISTS get_dashboard_summary(TIMESTAMPTZ, TIMESTAMPTZ);

-- Fix the EXECUTE grants that still reference the now-dropped signature.
REVOKE EXECUTE ON FUNCTION get_dashboard_summary(DATE, DATE) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_dashboard_summary(DATE, DATE) TO service_role;
