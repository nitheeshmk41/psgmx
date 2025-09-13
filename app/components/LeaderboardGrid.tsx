import LeaderboardCard from "./LeaderboardCard";
import { User } from "@/lib/refreshUser";

interface LeaderboardGridProps {
  users: User[];
  refreshingIds: number[];
  refreshUser: (user: User) => Promise<User>;
}

export default function LeaderboardGrid({
  users,
  refreshingIds,
  refreshUser,
}: LeaderboardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
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
