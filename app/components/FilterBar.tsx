interface FilterBarProps {
  filterClass: "G1" | "G2" | "ALL";
  setFilterClass: (val: "G1" | "G2" | "ALL") => void;
}

export default function FilterBar({
  filterClass,
  setFilterClass,
}: FilterBarProps) {
  const buttons = [
    { label: "All Students", value: "ALL" },
    { label: "G1", value: "G1" },
    { label: "G2", value: "G2" },
  ];

  return (
    <div className="flex space-x-2 p-6">
      {buttons.map((btn) => (
        <button
          key={btn.value}
          onClick={() => setFilterClass(btn.value as "ALL" | "G1" | "G2")}
          className={`px-4 py-2 rounded ${
            filterClass === btn.value
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300"
          } hover:bg-blue-500 transition`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
