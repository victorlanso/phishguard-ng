export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Users</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-slate-500">
          Manage organisation users, roles and departments. Connect to the{" "}
          <code className="text-sm bg-slate-100 px-1 rounded">users</code> table.
        </p>
      </div>
    </div>
  );
}
