-- indexes for users table (email lookup on invite; created_at for list ordering)
CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at ASC);

-- indexes for invoices table (no indexes existed at all)
CREATE INDEX idx_invoices_status        ON invoices(status);
CREATE INDEX idx_invoices_date          ON invoices(date DESC);
CREATE INDEX idx_invoices_created_by_id ON invoices(created_by_id);
CREATE INDEX idx_invoices_created_at    ON invoices(created_at DESC);

-- composite index for dashboard date-range queries (status already filters first)
CREATE INDEX idx_movements_status_date ON movements(status, movement_date DESC);

-- index on the stored generated column used in ilike search
CREATE INDEX idx_movements_folio_display ON movements(folio_display);
