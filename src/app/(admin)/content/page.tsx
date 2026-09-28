export default function ContentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Content Management
      </h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-slate-500">
          Manage daily tips and quizzes here. Connect to the{" "}
          <code className="text-sm bg-slate-100 px-1 rounded">content_items</code>{" "}
          table in Supabase.
        </p>
      </div>
    </div>
  );
}
