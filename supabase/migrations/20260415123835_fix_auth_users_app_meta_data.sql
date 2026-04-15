-- Fix auth.users rows created via RPC that are missing the raw_app_meta_data
-- provider/providers fields that GoTrue sets during normal signup and reads
-- during sign-in. Without these, GoTrue returns 500 unexpected_failure.
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
  || '{"provider":"email","providers":["email"]}'::jsonb
WHERE NOT (COALESCE(raw_app_meta_data, '{}'::jsonb) ? 'provider');

-- Also update the RPCs to set raw_app_meta_data correctly on new users.
CREATE OR REPLACE FUNCTION create_initial_admin(
  p_email      TEXT,
  p_password   TEXT,
  p_full_name  TEXT
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
    RAISE EXCEPTION 'Initial admin already exists. Use create_user_with_role instead.';
  END IF;

  new_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data, created_at, updated_at,
    role, aud, instance_id
  ) VALUES (
    new_id, p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('full_name', p_full_name),
    '{"provider":"email","providers":["email"]}'::jsonb,
    NOW(), NOW(),
    'authenticated', 'authenticated',
    '00000000-0000-0000-0000-000000000000'
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_id, new_id,
    jsonb_build_object('sub', new_id::text, 'email', p_email),
    'email',
    p_email,
    NOW(), NOW(), NOW()
  );

  INSERT INTO users (id, full_name, email, role, active)
  VALUES (new_id, p_full_name, p_email, 'ADMIN', true);

  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_user_with_role(
  p_email      TEXT,
  p_password   TEXT,
  p_full_name  TEXT,
  p_role       user_role DEFAULT 'VIEWER'
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_id UUID;
BEGIN
  IF get_my_role() != 'ADMIN' THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  new_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data, created_at, updated_at,
    role, aud, instance_id
  ) VALUES (
    new_id, p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('full_name', p_full_name),
    '{"provider":"email","providers":["email"]}'::jsonb,
    NOW(), NOW(),
    'authenticated', 'authenticated',
    '00000000-0000-0000-0000-000000000000'
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_id, new_id,
    jsonb_build_object('sub', new_id::text, 'email', p_email),
    'email',
    p_email,
    NOW(), NOW(), NOW()
  );

  INSERT INTO users (id, full_name, email, role, active)
  VALUES (new_id, p_full_name, p_email, p_role, true);

  RETURN new_id;
END;
$$;
