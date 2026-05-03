import {
  createBudgetPeriod,
  releaseBudgetPeriod,
  closeBudgetPeriod,
  listBudgetsByPeriod,
  upsertMinistryBudget
} from "../budget"

const mockGetCurrentUser = jest.fn()
const mockDb = {}
const mockCreateSupabaseServerClient = jest.fn(() => Promise.resolve(mockDb))
const mockCan = jest.fn()
const mockCreatePeriod = jest.fn()
const mockReleasePeriod = jest.fn()
const mockClosePeriod = jest.fn()
const mockListBudgets = jest.fn()
const mockUpsertBudget = jest.fn()
const mockRevalidatePath = jest.fn()

jest.mock("@/lib/supabase/server", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  createSupabaseServerClient: () => mockCreateSupabaseServerClient()
}))

jest.mock("@/lib/permissions/rbac", () => ({
  PERMISSIONS: { MANAGE_BUDGETS: "MANAGE_BUDGETS" },
  can: (...args: unknown[]) => mockCan(...args)
}))

jest.mock("@/services/budget/budget.service", () => ({
  budgetService: {
    createPeriod: (...args: unknown[]) => mockCreatePeriod(...args),
    releasePeriod: (...args: unknown[]) => mockReleasePeriod(...args),
    closePeriod: (...args: unknown[]) => mockClosePeriod(...args),
    listBudgetsByPeriod: (...args: unknown[]) => mockListBudgets(...args),
    upsertMinistryBudget: (...args: unknown[]) => mockUpsertBudget(...args)
  }
}))

jest.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args)
}))

const mockUser = { id: "user-1", permissions: ["MANAGE_BUDGETS"] }

describe("budget actions — auth guard", () => {
  beforeEach(() => jest.clearAllMocks())

  it.each([
    [
      "createBudgetPeriod",
      () => createBudgetPeriod({ name: "2026", start_date: "2026-05-01", end_date: "2027-04-30" })
    ],
    ["releaseBudgetPeriod", () => releaseBudgetPeriod("p-1")],
    ["closeBudgetPeriod", () => closeBudgetPeriod("p-1")],
    ["listBudgetsByPeriod", () => listBudgetsByPeriod("p-1")],
    [
      "upsertMinistryBudget",
      () => upsertMinistryBudget({ period_id: "p-1", ministry_id: "m-1", amount: 1000 })
    ]
  ])("%s throws when unauthenticated", async (_name, fn) => {
    mockGetCurrentUser.mockResolvedValue(null)
    mockCan.mockReturnValue(false)
    await expect(fn()).rejects.toThrow("Sin permisos")
  })
})

describe("createBudgetPeriod", () => {
  beforeEach(() => jest.clearAllMocks())

  it("creates period and revalidates", async () => {
    const period = { id: "p-1", year: 2026 }
    mockGetCurrentUser.mockResolvedValue(mockUser)
    mockCan.mockReturnValue(true)
    mockCreatePeriod.mockResolvedValue(period)

    const periodInput = { name: "2026", start_date: "2026-05-01", end_date: "2027-04-30" }
    const data = await createBudgetPeriod(periodInput)

    expect(mockCreatePeriod).toHaveBeenCalledWith(mockDb, periodInput, mockUser.id)
    expect(mockRevalidatePath).toHaveBeenCalledWith("/budget")
    expect(data).toEqual(period)
  })
})

describe("releaseBudgetPeriod", () => {
  beforeEach(() => jest.clearAllMocks())

  it("releases period and revalidates", async () => {
    const period = { id: "p-1", status: "ACTIVE" }
    mockGetCurrentUser.mockResolvedValue(mockUser)
    mockCan.mockReturnValue(true)
    mockReleasePeriod.mockResolvedValue(period)

    const data = await releaseBudgetPeriod("p-1")

    expect(mockReleasePeriod).toHaveBeenCalledWith(mockDb, "p-1", mockUser.id)
    expect(mockRevalidatePath).toHaveBeenCalledWith("/budget")
    expect(data).toEqual(period)
  })
})

describe("upsertMinistryBudget", () => {
  beforeEach(() => jest.clearAllMocks())

  it("upserts budget and revalidates", async () => {
    const budget = { id: "b-1", amount: 1000 }
    const input = { period_id: "p-1", ministry_id: "m-1", amount: 1000 }
    mockGetCurrentUser.mockResolvedValue(mockUser)
    mockCan.mockReturnValue(true)
    mockUpsertBudget.mockResolvedValue(budget)

    const data = await upsertMinistryBudget(input)

    expect(mockUpsertBudget).toHaveBeenCalledWith(mockDb, input, mockUser.id)
    expect(mockRevalidatePath).toHaveBeenCalledWith("/budget")
    expect(data).toEqual(budget)
  })
})
