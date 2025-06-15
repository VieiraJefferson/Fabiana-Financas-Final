"use client"

import * as React from "react"
import {
  Label,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Cell,
} from "recharts"

import { cn } from "@/lib/utils"
import { Card } from "./card"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export function ChartContainer({
  title,
  description,
  className,
  children,
  ...props
}: ChartContainerProps) {
  return (
    <Card className={cn("w-full", className)} {...props}>
      <div className="p-4 md:p-6">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="mt-4 h-[300px]">{children}</div>
      </div>
    </Card>
  )
}

export const ChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-xs uppercase text-muted-foreground">
              {data.name}
            </span>
            <span className="font-bold text-foreground">{data.value}</span>
          </div>
        </div>
      </div>
    )
  }

  return null
} 