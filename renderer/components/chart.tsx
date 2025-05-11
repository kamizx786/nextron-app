"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart"

interface ConfidenceChartProps {
  confidences: {
    [key: string]: number
  }
}

export default function ConfidenceChart({ confidences }: ConfidenceChartProps) {
  // Transform the confidence data for the chart
  const chartData = Object.entries(confidences).map(([name, value]) => ({
    name,
    value,
  }))

  // Sort data by confidence value (descending)
  chartData.sort((a, b) => b.value - a.value)

  // Define colors for different disease types
  const getColorForDisease = (diseaseName: string) => {
    if (diseaseName.includes("Healthy")) return "hsl(142, 76%, 36%)" // Green
    if (diseaseName.includes("Smut")) return "hsl(45, 93%, 47%)" // Amber
    if (diseaseName.includes("Leaf Rust")) return "hsl(26, 90%, 57%)" // Orange
    if (diseaseName.includes("Crown")) return "hsl(0, 84%, 60%)" // Red
    return "hsl(220, 13%, 50%)" // Gray
  }

  // Create config for the chart
  const chartConfig = chartData.reduce((config, item) => {
    return {
      ...config,
      [item.name]: {
        label: item.name,
        color: getColorForDisease(item.name),
      },
    }
  }, {})

  return (
    <div className="w-full h-[300px] mt-4">
      <ChartContainer config={chartConfig} className="h-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{
            left: 0,
            right: 16,
          }}
        >
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            width={120}
            tickFormatter={(value) => {
              // Shorten the disease name for display
              if (value.length > 15) {
                return value.substring(0, 15) + "..."
              }
              return value
            }}
          />
          <XAxis dataKey="value" type="number" tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(2)}%`} />} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            // Use the color from the config based on the name
            fill="var(--color-current)"
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
