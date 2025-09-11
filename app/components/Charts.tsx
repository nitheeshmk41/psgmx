"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartsProps {
  users: any[];
}

export default function Charts({ users }: ChartsProps) {
  const weeklyData = users.map((u) => ({
    name: u.username,
    solved: u.weekly_solved,
  }));

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Weekly Solved Problems
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>
          <XAxis
            dataKey="name"
            tick={{ fill: "currentColor" }}
            className="text-gray-600 dark:text-gray-300 text-sm"
          />
          <YAxis
            tick={{ fill: "currentColor" }}
            className="text-gray-600 dark:text-gray-300"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--foreground)",
            }}
          />
          <Bar
            dataKey="solved"
            fill="#4ade80"
            radius={[4, 4, 0, 0]}
            className="hover:opacity-80 transition-opacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}