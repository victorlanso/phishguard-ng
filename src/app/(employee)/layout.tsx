import BottomNav from "@/components/layout/BottomNav";
import AdminLink from "@/components/layout/AdminLink";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              PG
            </div>
            <span className="font-semibold text-slate-900">PhishGuard NG</span>
          </div>

          <div className="flex items-center gap-3">
            <AdminLink />
            <div className="text-sm font-medium text-brand-600">120 pts</div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">{children}</main>

      <BottomNav />
    </div>
  );
}
