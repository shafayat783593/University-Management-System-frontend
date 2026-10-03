"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Collected = green, pending = amber, failed = red.
const COLORS = ["#16a34a", "#d97706", "#dc2626"];

// Simple finance breakdown: collected vs pending vs failed/cancelled.
export default function FinanceChart({
  collected,
  pending,
  failed,
}: {
  collected: number;
  pending: number;
  failed: number;
}) {
  const data = [
    { name: "Collected", amount: collected },
    { name: "Pending", amount: pending },
    { name: "Failed", amount: failed },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -10 }}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => [value, "Amount"]} />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
