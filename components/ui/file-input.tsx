"use client"

import { Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

type FileInputProps = {
  id?: string
  value: File | null
  onChange: (file: File | null) => void
  accept?: string
  placeholder?: string
  className?: string
}

export function FileInput({
  id,
  value,
  onChange,
  accept = "image/*,application/pdf;capture=camera",
  placeholder = "Seleccionar archivo o tomar foto",
  className
}: FileInputProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="flex h-20 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/40 hover:bg-muted"
      >
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
        <Paperclip className="size-4 text-muted-foreground/60" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          {value ? value.name : placeholder}
        </span>
      </label>
      {value && value.type.startsWith("image/") && (
        <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={URL.createObjectURL(value)}
            alt="Vista previa"
            className="size-12 object-cover rounded-lg border border-border"
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{value.name}</p>
            <p className="text-[11px] text-muted-foreground">{(value.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}
    </div>
  )
}
