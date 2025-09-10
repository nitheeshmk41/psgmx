import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LeaderboardCardProps {
  user: any;
  refreshing: boolean;
  refreshUser: (user: any) => void;
}

export default function LeaderboardCard({
  user,
  refreshing,
  refreshUser,
}: LeaderboardCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition">
      <CardHeader>
        <CardTitle>
          {user.username} ({user.roll_num})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={user.profileimg || "/placeholder.png"}
          alt={user.username}
          className="w-16 h-16 rounded-full mb-3"
        />
        <p>Class: {user.class}</p>
        <p>Total Solved: {user.totalsolved}</p>
        <p>Weekly Solved: {user.weekly_solved}</p>
        <p>
          Easy: {user.easy_solved} | Medium: {user.medium_solved} | Hard:{" "}
          {user.hard_solved}
        </p>
        <p>Last Active: {user.last_active || "-"}</p>
        <p>Top Languages: {user.recent_languages?.join(", ") || "-"}</p>
        <Button
          onClick={() => refreshUser(user)}
          disabled={refreshing}
          className="mt-3 w-full"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </CardContent>
    </Card>
  );
}
