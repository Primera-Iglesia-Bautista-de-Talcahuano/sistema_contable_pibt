"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function RegeneratePdfButton({ movementId }: { movementId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onClick() {
    setLoading(true)
    const promise = fetch(`/api/movements/${movementId}/regenerate-pdf`, {
      method: "POST"
    }).then(async (res) => {
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(payload.message ?? "No se pudo regenerar el PDF.")
      }
    })

    toast.promise(promise, {
      loading: "Regenerando PDF...",
      success: () => {
        router.refresh()
        return "PDF regenerado"
      },
      error: (e: Error) => e.message
    })

    await promise.catch(() => {})
    setLoading(false)
  }

  return (
    <Button type="button" variant="outline" disabled={loading} onClick={onClick} className="h-11">
      {loading ? "Procesando..." : "Regenerar PDF"}
    </Button>
  )
}
