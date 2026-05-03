import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser, createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { budgetService } from "@/services/budget/budget.service"
import { ministriesService } from "@/services/ministries/ministries.service"
import { BudgetItemsClient } from "@/components/budget/budget-items-client"
import { formatDate, formatCLP } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Aprobado",
  CLOSED: "Cerrado"
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-muted-foreground bg-muted",
  ACTIVE: "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  CLOSED: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
}

export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_BUDGETS)) redirect("/dashboard")

  const db = await createSupabaseServerClient()
  const [period, items, ministries] = await Promise.all([
    budgetService.getPeriodById(db, id).catch(() => null),
    budgetService.listItemsByPeriod(db, id).catch(() => []),
    ministriesService.list(db)
  ])

  if (!period) notFound()

  const totalAmount = items.reduce((sum, i) => sum + Number(i.amount), 0)
  const activeMinistries = ministries.filter((m) => m.is_active)

  return (
    <div className="space-y-6">
      {/* Print header — hidden on screen */}
      <div className="hidden print:block mb-6">
        <h1 className="text-xl font-bold">Presupuesto: {period.name}</h1>
        <p className="text-sm text-gray-500">
          {formatDate(period.start_date)} – {formatDate(period.end_date)} · Estado:{" "}
          {STATUS_LABELS[period.status]} · Total: {formatCLP(totalAmount)}
        </p>
      </div>

      {/* Screen header */}
      <div className="flex items-start gap-4 print:hidden">
        <Link
          href="/budget"
          className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold truncate">{period.name}</h1>
            <span
              className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[period.status]}`}
            >
              {STATUS_LABELS[period.status]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(period.start_date)} – {formatDate(period.end_date)} · Total:{" "}
            <span className="font-medium text-foreground">{formatCLP(totalAmount)}</span>
          </p>
        </div>
      </div>

      <BudgetItemsClient
        period={{ id: period.id, name: period.name, status: period.status }}
        initialItems={items as Parameters<typeof BudgetItemsClient>[0]["initialItems"]}
        ministries={activeMinistries}
      />

      {/* Print-only styles */}
      <style>{`
        @media print {
          nav, aside, header { display: none !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  )
}
