import LeaderboardCard from "./LeaderboardCard";

interface LeaderboardGridProps {
  users: any[];
  refreshingIds: number[];
  refreshUser: (user: any) => void;
}

export default function LeaderboardGrid({
  users,
  refreshingIds,
  refreshUser,
}: LeaderboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {users.map((user) => (
        <LeaderboardCard
          key={user.id}
          user={user}
          refreshing={refreshingIds.includes(user.id)}
          refreshUser={refreshUser}
        />
      ))}
    </div>
  );
}
