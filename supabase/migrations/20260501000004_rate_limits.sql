-- ============================================================
-- Rate limits table + atomic check/increment function.
-- Used server-side to throttle auth endpoints (forgot-password).
-- Only service_role accesses this table — no RLS needed.
-- ============================================================

CREATE TABLE rate_limits (
  key          TEXT        PRIMARY KEY,
  count        INTEGER     NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- check_and_increment_rate_limit(key, limit, window_seconds)
--
-- Atomically increments the counter for `key` within the rolling
-- window. If the window has expired it resets to 1.
-- Returns (allowed, remaining):
--   allowed   = true  when count ≤ limit (request should proceed)
--   remaining = requests left in the current window
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_key            TEXT,
  p_limit          INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count  INTEGER;
BEGIN
  INSERT INTO rate_limits (key, count, window_start)
  VALUES (p_key, 1, now())
  ON CONFLICT (key) DO UPDATE
    SET
      count        = CASE
                       WHEN rate_limits.window_start > now() - (p_window_seconds || ' seconds')::INTERVAL
                       THEN rate_limits.count + 1
                       ELSE 1
                     END,
      window_start = CASE
                       WHEN rate_limits.window_start > now() - (p_window_seconds || ' seconds')::INTERVAL
                       THEN rate_limits.window_start
                       ELSE now()
                     END
  RETURNING rate_limits.count INTO v_count;

  RETURN QUERY SELECT
    v_count <= p_limit,
    GREATEST(p_limit - v_count, 0);
END;
$$;

REVOKE EXECUTE ON FUNCTION check_and_increment_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION check_and_increment_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- Periodic cleanup: purge rows older than 1 day to keep the table small.
-- Call manually or from a cron job; no harm if skipped.
CREATE OR REPLACE FUNCTION prune_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM rate_limits WHERE window_start < now() - INTERVAL '1 day';
$$;

REVOKE EXECUTE ON FUNCTION prune_rate_limits() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION prune_rate_limits()                     TO service_role;
