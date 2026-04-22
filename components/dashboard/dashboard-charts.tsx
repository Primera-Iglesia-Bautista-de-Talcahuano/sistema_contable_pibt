"use client"

import { memo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia
} from "@/components/ui/empty"
import { BarChart2, PieChart as PieChartIcon } from "lucide-react"

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
})

type SerieItem = { name: string; ingresos: number; egresos: number }
type CategoriaItem = { categoria: string; total: number }

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)"
]

const ingresosEgresosConfig = {
  ingresos: {
    label: "Ingresos",
    color: "var(--color-primary)"
  },
  egresos: {
    label: "Egresos",
    color: "var(--color-expense)"
  }
} satisfies ChartConfig

export const IngresosEgresosChart = memo(function IngresosEgresosChart({ data }: { data: SerieItem[] }) {
  if (!data.length) {
    return (
      <Empty className="border-dashed h-[300px] sm:h-72">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BarChart2 />
          </EmptyMedia>
          <EmptyTitle>Sin datos</EmptyTitle>
          <EmptyDescription>No hay movimientos en el período seleccionado.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="h-[300px] sm:h-72 w-full">
      <ChartContainer config={ingresosEgresosConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--outline-variant) / 0.3)"
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={11}
              stroke="var(--color-muted-foreground)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={5}
              fontSize={11}
              width={40}
              stroke="var(--color-muted-foreground)"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--on-surface-variant) / 0.05)" }}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              content={({ payload }) => (
                <div className="flex justify-end gap-4 sm:gap-6 mb-6">
                  {payload?.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            />
            <Bar
              dataKey="ingresos"
              fill="var(--color-ingresos)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar dataKey="egresos" fill="var(--color-egresos)" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
})

const getCategoriaConfig = (data: CategoriaItem[]) => {
  const config: ChartConfig = {
    total: {
      label: "Total Registrado"
    }
  }
  data.forEach((item, index) => {
    config[item.categoria] = {
      label: item.categoria,
      color: COLORS[index % COLORS.length]
    }
  })
  return config
}

export const CategoriaChart = memo(function CategoriaChart({ data }: { data: CategoriaItem[] }) {
  if (!data.length) {
    return (
      <Empty className="border-dashed h-[200px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PieChartIcon />
          </EmptyMedia>
          <EmptyTitle>Sin categorías</EmptyTitle>
          <EmptyDescription>No hay datos para el período seleccionado.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const finalData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }))
  const config = getCategoriaConfig(data)

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      {/* Fixed-height pie — never shrinks based on legend */}
      <div className="h-[200px] w-full">
        <ChartContainer config={config} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={finalData}
                dataKey="total"
                nameKey="categoria"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                stroke="none"
                cx="50%"
                cy="50%"
              >
                {finalData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="hover:opacity-80 transition-opacity outline-none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Legend outside Recharts — always 2 columns, never affects chart size */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
        {finalData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 min-w-0">
            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              {entry.categoria}
            </span>
            <span className="text-xs font-black text-foreground ml-auto shrink-0">
              {clp.format(entry.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
