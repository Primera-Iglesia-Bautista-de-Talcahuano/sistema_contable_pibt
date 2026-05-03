// Strip PostgREST filter DSL metacharacters from user input before
// interpolating into a Supabase .or() string. Without this, a comma or
// parenthesis lets the user add or group their own filter expressions.
const POSTGREST_META = /[,()\\]/g

export function sanitizePostgrestSearch(input: string, maxLen = 100): string {
  return input.replace(POSTGREST_META, "").slice(0, maxLen).trim()
}
