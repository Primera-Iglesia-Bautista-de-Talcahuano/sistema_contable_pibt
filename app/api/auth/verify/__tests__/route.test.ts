/**
 * @jest-environment node
 */
import { GET } from "../route"
import { NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const ORIGIN = "https://pibtalcahuano.com"

jest.mock("@/lib/supabase/server")

const mockedCreateClient = jest.mocked(createSupabaseServerClient)

function makeRequest(params: Record<string, string>) {
  const url = new URL(`${ORIGIN}/api/auth/verify`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url.toString(), { headers: new Headers() })
}

let mockSignOut: jest.Mock
let mockVerifyOtp: jest.Mock

beforeEach(() => {
  mockSignOut = jest.fn().mockResolvedValue({})
  mockVerifyOtp = jest.fn().mockResolvedValue({ error: null })
  mockedCreateClient.mockResolvedValue({
    auth: { signOut: mockSignOut, verifyOtp: mockVerifyOtp }
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>)
})

describe("GET /api/auth/verify", () => {
  it("signs out and calls verifyOtp then redirects to /activar on success", async () => {
    const req = makeRequest({ token: "abc123", type: "invite" })
    const res = await GET(req)

    expect(mockSignOut).toHaveBeenCalled()
    expect(mockVerifyOtp).toHaveBeenCalledWith({ token_hash: "abc123", type: "invite" })
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/activar")
  })

  it("redirects to /activar for recovery type on success", async () => {
    const req = makeRequest({ token: "xyz789", type: "recovery" })
    const res = await GET(req)

    expect(mockVerifyOtp).toHaveBeenCalledWith({ token_hash: "xyz789", type: "recovery" })
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/activar")
  })

  it("redirects to / with error=link_expired when verifyOtp fails", async () => {
    mockVerifyOtp.mockResolvedValue({ error: new Error("Token expired") })
    const req = makeRequest({ token: "abc123", type: "invite" })
    const res = await GET(req)

    expect(res.status).toBe(307)
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/")
    expect(location.searchParams.get("error")).toBe("link_expired")
  })

  it("redirects to / with error=invalid_link when token missing", async () => {
    const req = makeRequest({ type: "invite" })
    const res = await GET(req)

    expect(mockVerifyOtp).not.toHaveBeenCalled()
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/")
    expect(location.searchParams.get("error")).toBe("invalid_link")
  })

  it("redirects to / with error=invalid_link when type missing", async () => {
    const req = makeRequest({ token: "abc123" })
    const res = await GET(req)

    expect(mockVerifyOtp).not.toHaveBeenCalled()
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/")
    expect(location.searchParams.get("error")).toBe("invalid_link")
  })

  it("redirects to / with error=invalid_link for invalid type", async () => {
    const req = makeRequest({ token: "abc123", type: "malicious_type" })
    const res = await GET(req)

    expect(mockVerifyOtp).not.toHaveBeenCalled()
    const location = new URL(res.headers.get("location")!)
    expect(location.pathname).toBe("/")
    expect(location.searchParams.get("error")).toBe("invalid_link")
  })

  it("accepts all valid EmailOtpTypes", async () => {
    const validTypes = ["signup", "invite", "magiclink", "recovery", "email_change", "email"]
    for (const type of validTypes) {
      const req = makeRequest({ token: "tok", type })
      const res = await GET(req)
      const location = new URL(res.headers.get("location")!)
      expect(location.pathname).toBe("/activar")
    }
  })

  it("passes token_hash through to verifyOtp without modification", async () => {
    const token = "MIGfMA0GCSqGSIb3DQEBAQUAA4GN+/="
    const req = makeRequest({ token, type: "invite" })
    await GET(req)

    expect(mockVerifyOtp).toHaveBeenCalledWith({ token_hash: token, type: "invite" })
  })
})
