const LEADERBOARD = [
  { rank: 1, name: "Adebayo O.", dept: "Finance", points: 340 },
  { rank: 2, name: "Chioma N.", dept: "HR", points: 310 },
  { rank: 3, name: "You", dept: "Operations", points: 120, isCurrent: true },
  { rank: 4, name: "Emeka I.", dept: "IT", points: 95 },
  { rank: 5, name: "Fatima A.", dept: "Sales", points: 80 },
];

export default function LeaderboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">This week’s top reporters</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {LEADERBOARD.map((user, idx) => (
          <div
            key={user.rank}
            className={`flex items-center gap-3 px-4 py-3.5 ${
              idx !== LEADERBOARD.length - 1 ? "border-b border-slate-100" : ""
            } ${user.isCurrent ? "bg-brand-50" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                user.rank === 1
                  ? "bg-yellow-100 text-yellow-700"
                  : user.rank === 2
                  ? "bg-slate-200 text-slate-600"
                  : user.rank === 3
                  ? "bg-orange-100 text-orange-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {user.rank}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900">
                {user.name}
                {user.isCurrent && (
                  <span className="ml-1.5 text-xs text-brand-600 font-normal">
                    (You)
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">{user.dept}</div>
            </div>

            <div className="font-semibold text-slate-900">{user.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
