/**
 * @jest-environment node
 */
import { GET } from "../route"
import { NextRequest } from "next/server"

const SUPABASE_URL = "http://localhost:54321"
const ORIGIN = "https://pibtalcahuano.com"

function makeRequest(params: Record<string, string>) {
  const url = new URL(`${ORIGIN}/api/auth/verify`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url.toString(), { headers: new Headers() })
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
})

describe("GET /api/auth/verify", () => {
  it("redirects to Supabase verify with token, type and redirect_to", async () => {
    const req = makeRequest({ token: "abc123", type: "invite" })
    const res = await GET(req)

    expect(res.status).toBe(307)
    const location = new URL(res.headers.get("location")!)
    expect(location.origin).toBe(SUPABASE_URL)
    expect(location.pathname).toBe("/auth/v1/verify")
    expect(location.searchParams.get("token")).toBe("abc123")
    expect(location.searchParams.get("type")).toBe("invite")
    expect(location.searchParams.get("redirect_to")).toBe(`${ORIGIN}/auth/callback`)
  })

  it("redirects to Supabase for recovery type", async () => {
    const req = makeRequest({ token: "xyz789", type: "recovery" })
    const res = await GET(req)

    expect(res.status).toBe(307)
    const location = new URL(res.headers.get("location")!)
    expect(location.searchParams.get("type")).toBe("recovery")
  })

  it("redirects to login when token missing", async () => {
    const req = makeRequest({ type: "invite" })
    const res = await GET(req)

    expect(res.status).toBe(307)
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/auth/login")
    expect(location.searchParams.get("error")).toBe("invalid_link")
  })

  it("redirects to login when type missing", async () => {
    const req = makeRequest({ token: "abc123" })
    const res = await GET(req)

    expect(res.status).toBe(307)
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/auth/login")
    expect(location.searchParams.get("error")).toBe("invalid_link")
  })

  it("redirects to login for invalid type", async () => {
    const req = makeRequest({ token: "abc123", type: "malicious_type" })
    const res = await GET(req)

    expect(res.status).toBe(307)
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/auth/login")
    expect(location.searchParams.get("error")).toBe("invalid_link")
  })

  it("accepts all valid EmailOtpTypes", async () => {
    const validTypes = ["signup", "invite", "magiclink", "recovery", "email_change", "email"]
    for (const type of validTypes) {
      const req = makeRequest({ token: "tok", type })
      const res = await GET(req)
      const location = new URL(res.headers.get("location")!)
      expect(location.hostname).toBe(new URL(SUPABASE_URL).hostname)
    }
  })

  it("token passes through without double-encoding", async () => {
    const token = "MIGfMA0GCSqGSIb3DQEBAQUAA4GN+/="
    const req = makeRequest({ token, type: "invite" })
    const res = await GET(req)

    const location = new URL(res.headers.get("location")!)
    expect(location.searchParams.get("token")).toBe(token)
  })
})
