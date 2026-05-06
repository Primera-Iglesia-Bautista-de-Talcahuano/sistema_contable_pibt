import { Section, Text } from "react-email"

import { ActionButton, BaseEmail } from "./components/base-email"
import { formatCLP } from "@/lib/utils"

const ACTION_LABELS: Record<string, string> = {
  CREATED: "agregado",
  UPDATED: "modificado",
  DELETED: "eliminado"
}

export function BudgetChangeEmail({
  action,
  item,
  periodName,
  changedByName,
  budgetUrl
}: {
  action: "CREATED" | "UPDATED" | "DELETED"
  item: { description: string; amount: number; ministry_name?: string | null; notes?: string | null }
  periodName: string
  changedByName: string
  budgetUrl: string
}) {
  const actionLabel = ACTION_LABELS[action] ?? action.toLowerCase()

  return (
    <BaseEmail preview={`Ítem ${actionLabel} en presupuesto — ${periodName}`}>
      <Section style={{ padding: "24px 32px 8px" }}>
        <Text style={{ margin: 0, fontSize: 18, color: "#222", fontWeight: 700 }}>
          Cambio en presupuesto aprobado
        </Text>
        <Text style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
          Período: <strong>{periodName}</strong>
        </Text>
      </Section>
      <Section style={{ padding: "8px 32px" }}>
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ border: "1px solid #eee", borderRadius: 6, overflow: "hidden" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: "8px 12px",
                  fontWeight: 600,
                  color: "#555",
                  borderBottom: "1px solid #eee",
                  width: "40%"
                }}
              >
                Acción
              </td>
              <td style={{ padding: "8px 12px", color: "#222", borderBottom: "1px solid #eee" }}>
                Ítem <strong>{actionLabel}</strong>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px 12px",
                  fontWeight: 600,
                  color: "#555",
                  borderBottom: "1px solid #eee"
                }}
              >
                Descripción
              </td>
              <td style={{ padding: "8px 12px", color: "#222", borderBottom: "1px solid #eee" }}>
                {item.description}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px 12px",
                  fontWeight: 600,
                  color: "#555",
                  borderBottom: "1px solid #eee"
                }}
              >
                Monto
              </td>
              <td style={{ padding: "8px 12px", color: "#222", borderBottom: "1px solid #eee" }}>
                {formatCLP(item.amount)}
              </td>
            </tr>
            {item.ministry_name && (
              <tr>
                <td
                  style={{
                    padding: "8px 12px",
                    fontWeight: 600,
                    color: "#555",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  Ministerio
                </td>
                <td
                  style={{ padding: "8px 12px", color: "#222", borderBottom: "1px solid #eee" }}
                >
                  {item.ministry_name}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#555" }}>
                Realizado por
              </td>
              <td style={{ padding: "8px 12px", color: "#222" }}>{changedByName}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Section style={{ padding: "24px 32px" }}>
        <ActionButton label="Ver presupuesto" url={budgetUrl} />
      </Section>
    </BaseEmail>
  )
}
