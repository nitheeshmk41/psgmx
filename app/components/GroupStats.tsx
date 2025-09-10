import StatsCard from "./StatsCard";

interface GroupStatsProps {
  groupName: string;
  members: number;
  totalSolved: number;
  weeklyProgress: number;
  weeklyTop: string;
  overallTop: string;
  color?: string;
}

export default function GroupStats({
  groupName,
  members,
  totalSolved,
  weeklyProgress,
  weeklyTop,
  overallTop,
  color = "bg-gray-900/50",
}: GroupStatsProps) {
  return (
    <div
      className={`p-4 rounded-xl ${color} border border-gray-700 backdrop-blur-md shadow-lg`}
    >
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        {groupName}{" "}
        <span className="text-sm text-gray-400">({members} members)</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <StatsCard title="Total Solved" value={totalSolved} />
        <StatsCard title="Weekly Progress" value={weeklyProgress} />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-2 text-gray-300">
        <div>
          Weekly Top:{" "}
          <span className="font-semibold text-white">{weeklyTop} 🏆</span>
        </div>
        <div>
          Overall Top:{" "}
          <span className="font-semibold text-white">{overallTop} 🏅</span>
        </div>
      </div>
    </div>
  );
}
