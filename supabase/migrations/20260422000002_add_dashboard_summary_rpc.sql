-- Returns pre-aggregated dashboard data so the app never transfers full movement rows.
-- Called via supabase.rpc('get_dashboard_summary', { p_from, p_to }).
CREATE OR REPLACE FUNCTION get_dashboard_summary(
  p_from TIMESTAMPTZ DEFAULT NULL,
  p_to   TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_ingresos NUMERIC;
  v_total_egresos  NUMERIC;
  v_count          BIGINT;
  v_series         JSONB;
  v_categories     JSONB;
BEGIN
  -- KPIs: totals and movement count
  SELECT
    COALESCE(SUM(CASE WHEN movement_type = 'INCOME' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN movement_type = 'EXPENSE' THEN amount ELSE 0 END), 0),
    COUNT(*)
  INTO v_total_ingresos, v_total_egresos, v_count
  FROM movements
  WHERE status = 'ACTIVE'
    AND (p_from IS NULL OR movement_date >= p_from)
    AND (p_to   IS NULL OR movement_date <= p_to);

  -- Monthly series: 'YYYY-MM' keys for JS-side locale formatting
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('month', month_key, 'ingresos', ingresos, 'egresos', egresos)
      ORDER BY month_trunc
    ),
    '[]'::jsonb
  )
  INTO v_series
  FROM (
    SELECT
      DATE_TRUNC('month', movement_date)              AS month_trunc,
      to_char(DATE_TRUNC('month', movement_date), 'YYYY-MM') AS month_key,
      COALESCE(SUM(CASE WHEN movement_type = 'INCOME' THEN amount ELSE 0 END), 0) AS ingresos,
      COALESCE(SUM(CASE WHEN movement_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS egresos
    FROM movements
    WHERE status = 'ACTIVE'
      AND (p_from IS NULL OR movement_date >= p_from)
      AND (p_to   IS NULL OR movement_date <= p_to)
    GROUP BY DATE_TRUNC('month', movement_date)
  ) AS monthly;

  -- Top-8 categories by total amount
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('categoria', category, 'total', total)
      ORDER BY total DESC
    ),
    '[]'::jsonb
  )
  INTO v_categories
  FROM (
    SELECT category, SUM(amount) AS total
    FROM movements
    WHERE status = 'ACTIVE'
      AND (p_from IS NULL OR movement_date >= p_from)
      AND (p_to   IS NULL OR movement_date <= p_to)
    GROUP BY category
    ORDER BY total DESC
    LIMIT 8
  ) AS cats;

  RETURN jsonb_build_object(
    'totalIngresos',        v_total_ingresos,
    'totalEgresos',         v_total_egresos,
    'cantidadMovimientos',  v_count,
    'series',               v_series,
    'resumenPorCategoria',  v_categories
  );
END;
$$;
