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
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Weekly Solved Problems</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="solved" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
