import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export type RateLimitResult = { allowed: boolean; remaining: number }

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const admin = createSupabaseAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpcResult = await admin.rpc("check_and_increment_rate_limit" as any, {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds
    })

    if (rpcResult.error || !rpcResult.data) {
      // Fail open: allow if rate limit check itself errors
      console.error("Rate limit check failed", { key, error: rpcResult.error })
      return { allowed: true, remaining: limit }
    }

    const row = (rpcResult.data as unknown as RateLimitResult[])[0]
    return row ?? { allowed: true, remaining: limit }
  } catch {
    return { allowed: true, remaining: limit }
  }
}
