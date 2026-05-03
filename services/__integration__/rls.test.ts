/**
 * @jest-environment node
 *
 * RLS integration tests. Require a running local Supabase instance.
 * Run with: pnpm supabase start && pnpm test services/__integration__
 *
 * Skipped automatically when NEXT_PUBLIC_SUPABASE_URL is not set or not local.
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? ""

const isLocal =
  SUPABASE_URL.startsWith("http://127.0.0.1") || SUPABASE_URL.startsWith("http://localhost")

const describeIfLocal = isLocal && SUPABASE_URL && SECRET_KEY ? describe : describe.skip

describeIfLocal("RLS: unauthenticated client", () => {
  // createClient inside each test to avoid throwing at collection time when keys are empty
  it("cannot read movements table", async () => {
    const anon = createClient<Database>(SUPABASE_URL, PUBLISHABLE_KEY)
    const { data, error } = await anon.from("movements").select("id").limit(1)
    if (error) {
      expect(error.message).toMatch(/permission denied|JWT/i)
    } else {
      expect(data).toHaveLength(0)
    }
  })

  it("cannot read users table", async () => {
    const anon = createClient<Database>(SUPABASE_URL, PUBLISHABLE_KEY)
    const { data, error } = await anon.from("users").select("id").limit(1)
    if (error) {
      expect(error.message).toMatch(/permission denied|JWT/i)
    } else {
      expect(data).toHaveLength(0)
    }
  })

  it("cannot read role_permissions table", async () => {
    const anon = createClient<Database>(SUPABASE_URL, PUBLISHABLE_KEY)
    const { data, error } = await anon.from("role_permissions").select("*").limit(1)
    if (error) {
      expect(error.message).toMatch(/permission denied|JWT/i)
    } else {
      expect(data).toHaveLength(0)
    }
  })
})

describeIfLocal("RLS: admin client bypasses all policies", () => {
  it("can read role_permissions table", async () => {
    const admin = createClient<Database>(SUPABASE_URL, SECRET_KEY)
    const { data, error } = await admin.from("role_permissions").select("*").limit(1)
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("can read users table", async () => {
    const admin = createClient<Database>(SUPABASE_URL, SECRET_KEY)
    const { error } = await admin.from("users").select("id").limit(1)
    expect(error).toBeNull()
  })
})
