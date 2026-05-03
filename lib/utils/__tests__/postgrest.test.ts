import { sanitizePostgrestSearch } from "@/lib/utils/postgrest"

describe("sanitizePostgrestSearch", () => {
  it("returns plain text unchanged", () => {
    expect(sanitizePostgrestSearch("ofrenda")).toBe("ofrenda")
  })

  it("preserves accented characters and spaces", () => {
    expect(sanitizePostgrestSearch("misión año nuevo")).toBe("misión año nuevo")
  })

  it("strips commas that would split the .or() filter list", () => {
    expect(sanitizePostgrestSearch("a,id.eq.x")).toBe("aid.eq.x")
  })

  it("strips parentheses used for grouping", () => {
    expect(sanitizePostgrestSearch("(hack)")).toBe("hack")
  })

  it("strips backslashes", () => {
    expect(sanitizePostgrestSearch("a\\b")).toBe("ab")
  })

  it("caps length at default maxLen", () => {
    const long = "x".repeat(150)
    expect(sanitizePostgrestSearch(long).length).toBe(100)
  })

  it("respects custom maxLen", () => {
    expect(sanitizePostgrestSearch("abcdef", 3)).toBe("abc")
  })

  it("trims trailing whitespace after slicing", () => {
    expect(sanitizePostgrestSearch("hello   ")).toBe("hello")
  })

  it("preserves wildcards % and * (caller controls ilike pattern)", () => {
    expect(sanitizePostgrestSearch("100%")).toBe("100%")
    expect(sanitizePostgrestSearch("foo*bar")).toBe("foo*bar")
  })

  it("preserves common punctuation that is not part of the DSL", () => {
    expect(sanitizePostgrestSearch("juan.perez@example.com")).toBe("juan.perez@example.com")
  })
})
