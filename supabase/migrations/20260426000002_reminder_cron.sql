-- ============================================================
-- REMINDER CRON JOB
-- Runs daily at 08:00 UTC, marks intentions/settlements that
-- have been PENDING longer than app_settings.reminder_interval_days
-- as needing a reminder. The actual email is sent by the app's
-- /api/reminders/send endpoint (called by the cron via pg_net).
-- ============================================================

-- RPC that returns pending intentions/settlements that need a reminder email.
-- Called by the app's reminder endpoint.
CREATE OR REPLACE FUNCTION get_pending_reminders()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_interval_days  INTEGER;
  v_intentions     JSONB;
  v_settlements    JSONB;
  v_transfers      JSONB;
BEGIN
  SELECT COALESCE(value::integer, 2)
  INTO v_interval_days
  FROM app_settings
  WHERE key = 'reminder_interval_days';

  -- Intentions pending review for too long
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',          bi.id,
        'type',        'INTENTION',
        'ministry_id', bi.ministry_id,
        'amount',      bi.amount,
        'description', bi.description,
        'created_at',  bi.created_at,
        'days_pending', EXTRACT(DAY FROM now() - bi.created_at)::integer
      )
    ),
    '[]'::jsonb
  )
  INTO v_intentions
  FROM budget_intentions bi
  WHERE bi.status = 'PENDING'
    AND bi.created_at <= now() - (v_interval_days || ' days')::interval;

  -- Settlements pending review for too long
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',          es.id,
        'type',        'SETTLEMENT',
        'intention_id', es.intention_id,
        'amount',      es.amount,
        'description', es.description,
        'created_at',  es.created_at,
        'days_pending', EXTRACT(DAY FROM now() - es.created_at)::integer
      )
    ),
    '[]'::jsonb
  )
  INTO v_settlements
  FROM expense_settlements es
  WHERE es.status = 'PENDING'
    AND es.created_at <= now() - (v_interval_days || ' days')::interval;

  -- Approved intentions without a registered transfer
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',          bi.id,
        'type',        'MISSING_TRANSFER',
        'ministry_id', bi.ministry_id,
        'amount',      bi.amount,
        'reviewed_at', bi.reviewed_at,
        'days_waiting', EXTRACT(DAY FROM now() - bi.reviewed_at)::integer
      )
    ),
    '[]'::jsonb
  )
  INTO v_transfers
  FROM budget_intentions bi
  LEFT JOIN intention_transfers it ON it.intention_id = bi.id
  WHERE bi.status = 'APPROVED'
    AND it.id IS NULL
    AND bi.reviewed_at <= now() - (v_interval_days || ' days')::interval;

  RETURN jsonb_build_object(
    'intentions',       v_intentions,
    'settlements',      v_settlements,
    'missing_transfers', v_transfers
  );
END;
$$;
