import { wrapAuthLink } from "../link-wrapper"

const SUPABASE_URL = "http://localhost:54321"
const SITE_URL = "https://pibtalcahuano.com"

const makeSupabaseLink = (params: Record<string, string>) => {
  const url = new URL(`${SUPABASE_URL}/auth/v1/verify`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = SITE_URL
})

describe("wrapAuthLink", () => {
  it("wraps invite link through custom domain", () => {
    const supabaseLink = makeSupabaseLink({ token: "abc123", type: "invite" })
    const result = wrapAuthLink(supabaseLink)

    const url = new URL(result)
    expect(url.origin).toBe(SITE_URL)
    expect(url.pathname).toBe("/api/auth/verify")
    expect(url.searchParams.get("token")).toBe("abc123")
    expect(url.searchParams.get("type")).toBe("invite")
  })

  it("wraps recovery link through custom domain", () => {
    const supabaseLink = makeSupabaseLink({ token: "xyz789", type: "recovery" })
    const result = wrapAuthLink(supabaseLink)

    const url = new URL(result)
    expect(url.searchParams.get("type")).toBe("recovery")
    expect(url.searchParams.get("token")).toBe("xyz789")
  })

  it("preserves token with special characters without double-encoding", () => {
    const token = "MIGfMA0GCSqGSIb3DQEBAQUAA4GN+/="
    const supabaseLink = makeSupabaseLink({ token, type: "invite" })
    const result = wrapAuthLink(supabaseLink)

    const url = new URL(result)
    expect(url.searchParams.get("token")).toBe(token)
  })

  it("returns original link when token missing", () => {
    const supabaseLink = makeSupabaseLink({ type: "invite" })
    expect(wrapAuthLink(supabaseLink)).toBe(supabaseLink)
  })

  it("returns original link when type missing", () => {
    const supabaseLink = makeSupabaseLink({ token: "abc123" })
    expect(wrapAuthLink(supabaseLink)).toBe(supabaseLink)
  })

  it("uses NEXT_PUBLIC_SITE_URL env var", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://other-domain.com"
    const supabaseLink = makeSupabaseLink({ token: "abc123", type: "recovery" })
    const result = wrapAuthLink(supabaseLink)

    expect(result.startsWith("https://other-domain.com")).toBe(true)
  })

  it("falls back to localhost when NEXT_PUBLIC_SITE_URL unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    const supabaseLink = makeSupabaseLink({ token: "abc123", type: "invite" })
    const result = wrapAuthLink(supabaseLink)

    expect(result.startsWith("http://localhost:3000")).toBe(true)
  })

  it("wrapped URL does not contain Supabase origin", () => {
    const supabaseLink = makeSupabaseLink({ token: "tok", type: "invite" })
    const result = wrapAuthLink(supabaseLink)

    expect(result).not.toContain(SUPABASE_URL)
  })
})
