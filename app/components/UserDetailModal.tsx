"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { refreshUser } from "@/lib/refreshUser";

export default function UserDetailModal({ user, children }: any) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(user);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const updated = await refreshUser(data);
      setData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#4ade80", "#facc15", "#f87171"];
  const solved = {
    easy: data.easy_solved ?? 0,
    medium: data.medium_solved ?? 0,
    hard: data.hard_solved ?? 0,
  };

  const lastActiveFormatted = data.last_active
    ? new Date(data.last_active).toLocaleDateString("en-GB")
    : "-";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {data.username}
            <Button
              onClick={handleRefresh}
              size="icon"
              variant="ghost"
              disabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardContent className="space-y-4">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={data.profileimg} />
                <AvatarFallback>{data.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{data.username}</p>
                <p>Class: {data.class}</p>
                <p>Roll No: {data.roll_num}</p>
                <p>Total Solved: {data.totalsolved}</p>
                <p>
                  Difficulty: Easy: {solved.easy} | Medium: {solved.medium} |
                  Hard: {solved.hard}
                </p>
                <p>Top Languages: {data.recent_languages?.join(", ") || "-"}</p>
                <p>Last Active: {lastActiveFormatted}</p>
              </div>
            </div>

            {/* Solved Distribution Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Easy", value: solved.easy },
                      { name: "Medium", value: solved.medium },
                      { name: "Hard", value: solved.hard },
                    ]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {Object.values(solved).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Solved */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Calendar className="w-4 h-4 mr-1" /> Weekly:{" "}
                {data.weekly_solved}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
