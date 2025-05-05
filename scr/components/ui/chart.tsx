
import React from "react";
import {
  LineChart as ReChartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as ReChartsBarChart,
  Bar,
  TooltipProps,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { useLang } from "../../contexts/LangContext";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { formatCurrency } from "@/lib/helpers";

// LineChart component
interface LineChartProps {
  data: any[];
  title?: string;
  xAxisDataKey: string;
  series: { dataKey: string; name: string; stroke: string }[];
  className?: string;
  height?: number | string;
  showGridLines?: boolean;
}

export const LineChart = ({
  data,
  title,
  xAxisDataKey,
  series,
  className,
  height = 300,
  showGridLines = true,
}: LineChartProps) => {
  const { isRTL } = useLang();
  
  return (
    <Card className={cn("w-full", className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReChartsLineChart
              data={data}
              layout={isRTL ? "horizontal" : "horizontal"}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis
                dataKey={xAxisDataKey}
                reversed={isRTL}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={isRTL ? { textAlign: "right" } : {}}
              />
              <Legend />
              {series.map((s) => (
                <Line
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.stroke}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              ))}
            </ReChartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// BarChart component
interface BarChartProps {
  data: any[];
  title?: string;
  xAxisDataKey: string;
  series: { dataKey: string; name: string; fill: string }[];
  className?: string;
  height?: number | string;
  showGridLines?: boolean;
}

export const BarChart = ({
  data,
  title,
  xAxisDataKey,
  series,
  className,
  height = 300,
  showGridLines = true,
}: BarChartProps) => {
  const { isRTL } = useLang();
  
  return (
    <Card className={cn("w-full", className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReChartsBarChart
              data={data}
              layout={isRTL ? "horizontal" : "horizontal"}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis
                dataKey={xAxisDataKey}
                reversed={isRTL}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={isRTL ? { textAlign: "right" } : {}}
              />
              <Legend />
              {series.map((s) => (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.fill}
                />
              ))}
            </ReChartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// CustomTooltip for Recharts if needed
export const CustomTooltip = ({ 
  active, 
  payload, 
  label,
  formatter = (val) => val
}: TooltipProps<ValueType, NameType> & { 
  formatter?: (val: any) => any 
}) => {
  const { isRTL } = useLang();
  
  if (active && payload && payload.length) {
    return (
      <div className={`bg-popover p-2 rounded shadow-md border border-border ${isRTL ? 'rtl text-right' : 'ltr text-left'}`}>
        <p className="font-medium text-sm">{label}</p>
        <div className="mt-1">
          {payload.map((entry, index) => (
            <p 
              key={`item-${index}`} 
              className="text-xs"
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${formatter(entry.value)}`}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default { LineChart, BarChart, CustomTooltip };
