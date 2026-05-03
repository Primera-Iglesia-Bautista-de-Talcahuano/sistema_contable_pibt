-- Flip movement-attachments + invoice-attachments to private buckets, swap public SELECT
-- policies for authenticated-only, and backfill attachment_url columns to store storage
-- paths instead of full public URLs. Reads now require a signed URL minted server-side.

UPDATE storage.buckets
SET public = false
WHERE id IN ('movement-attachments', 'invoice-attachments');

DROP POLICY IF EXISTS "movement attachments are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "invoice attachments are publicly readable" ON storage.objects;

CREATE POLICY "authenticated users can read movement attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'movement-attachments');

CREATE POLICY "authenticated users can read invoice attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'invoice-attachments');

-- Backfill: extract storage path from existing public URLs.
-- Public URL form: https://<host>/storage/v1/object/public/<bucket>/<path>
-- Strip everything up to and including '/<bucket>/' so only the path remains.
UPDATE movements
SET attachment_url = regexp_replace(
  attachment_url,
  '^.*/storage/v1/object/public/movement-attachments/',
  ''
)
WHERE attachment_url LIKE '%/storage/v1/object/public/movement-attachments/%';

UPDATE invoices
SET attachment_url = regexp_replace(
  attachment_url,
  '^.*/storage/v1/object/public/invoice-attachments/',
  ''
)
WHERE attachment_url LIKE '%/storage/v1/object/public/invoice-attachments/%';
