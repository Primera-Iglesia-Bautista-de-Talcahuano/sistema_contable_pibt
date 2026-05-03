import { createInvoice, updateInvoiceStatus } from "../invoices"

const mockGetCurrentUser = jest.fn()
const mockDb = {}
const mockCreateSupabaseServerClient = jest.fn(() => Promise.resolve(mockDb))
const mockCan = jest.fn()
const mockCreate = jest.fn()
const mockUpdateStatus = jest.fn()
const mockRevalidatePath = jest.fn()

jest.mock("@/lib/supabase/server", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  createSupabaseServerClient: () => mockCreateSupabaseServerClient()
}))

jest.mock("@/lib/permissions/rbac", () => ({
  PERMISSIONS: { CREATE_MOVEMENT: "CREATE_MOVEMENT" },
  can: (...args: unknown[]) => mockCan(...args)
}))

jest.mock("@/services/invoices/invoices.service", () => ({
  invoicesService: {
    create: (...args: unknown[]) => mockCreate(...args),
    updateStatus: (...args: unknown[]) => mockUpdateStatus(...args)
  }
}))

jest.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args)
}))

const mockUser = { id: "user-1", permissions: ["CREATE_MOVEMENT"] }
const invoiceInput = {
  number: "BOL-001",
  date: "2026-05-01",
  amount: 5000,
  attachment_url: null
}

describe("createInvoice", () => {
  beforeEach(() => jest.clearAllMocks())

  it("throws when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null)
    mockCan.mockReturnValue(false)
    await expect(createInvoice(invoiceInput)).rejects.toThrow("Sin permisos")
  })

  it("creates invoice and revalidates", async () => {
    const created = { id: "inv-1", ...invoiceInput }
    mockGetCurrentUser.mockResolvedValue(mockUser)
    mockCan.mockReturnValue(true)
    mockCreate.mockResolvedValue(created)

    const data = await createInvoice(invoiceInput)

    expect(mockCreate).toHaveBeenCalledWith(mockDb, invoiceInput, mockUser.id)
    expect(mockRevalidatePath).toHaveBeenCalledWith("/rendiciones")
    expect(data).toEqual(created)
  })
})

describe("updateInvoiceStatus", () => {
  beforeEach(() => jest.clearAllMocks())

  it("throws when lacks permission", async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser)
    mockCan.mockReturnValue(false)
    await expect(updateInvoiceStatus("inv-1", "SETTLED")).rejects.toThrow("Sin permisos")
  })

  it("updates status and revalidates", async () => {
    const updated = { id: "inv-1", status: "SETTLED" }
    mockGetCurrentUser.mockResolvedValue(mockUser)
    mockCan.mockReturnValue(true)
    mockUpdateStatus.mockResolvedValue(updated)

    const data = await updateInvoiceStatus("inv-1", "SETTLED")

    expect(mockUpdateStatus).toHaveBeenCalledWith(mockDb, "inv-1", "SETTLED", mockUser.id)
    expect(mockRevalidatePath).toHaveBeenCalledWith("/rendiciones")
    expect(data).toEqual(updated)
  })
})
