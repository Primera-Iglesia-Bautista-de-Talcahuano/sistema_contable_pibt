"use client"

import * as React from "react"
import { es } from "date-fns/locale/es"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  name,
  defaultValue,
  value,
  onChange,
}: {
  name?: string
  defaultValue?: string
  value?: Date
  onChange?: (date: Date | undefined) => void
}) {
  const defaultDate = defaultValue ? new Date(defaultValue) : undefined
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(defaultDate)
  const date = value !== undefined ? value : internalDate;

  const handleSelect = (newDate: Date | undefined) => {
    setInternalDate(newDate);
    onChange?.(newDate);
  }

  return (
    <Popover>
      <PopoverTrigger render={
        <Button
          variant={"outline"}
          size="lg"
          className={cn(
            "w-full justify-start text-left font-normal bg-surface-container-low border border-outline/20 hover:bg-surface-container-high overflow-hidden",
            !date && "text-muted-foreground"
          )}
        />
      }>
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? date.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }) : <span className="truncate">Seleccionar fecha</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-popover text-popover-foreground shadow-md rounded-xl overflow-hidden ring-1 ring-border">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={es}
        />
      </PopoverContent>
      {/* Hidden input to allow native form submission method="GET" */}
      <input
        type="hidden"
        name={name}
        value={date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : ""}
      />
    </Popover>
  )
}
