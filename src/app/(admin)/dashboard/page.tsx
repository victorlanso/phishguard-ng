export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "New Reports", value: "12", color: "text-red-600" },
          { label: "Reports Today", value: "5", color: "text-slate-900" },
          { label: "Avg. Click Rate", value: "18%", color: "text-amber-600" },
          { label: "Training Completion", value: "74%", color: "text-green-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-lg mb-4">Recent Reports</h2>
        <p className="text-slate-500 text-sm">
          Connect your backend to see live reports here.
        </p>
      </div>
    </div>
  );
}
