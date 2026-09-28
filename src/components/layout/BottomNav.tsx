"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, AlertTriangle, BookOpen, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/report", label: "Report", icon: AlertTriangle },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/leaderboard", label: "Rank", icon: Trophy },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition-colors",
                isActive ? "text-brand-600" : "text-slate-500"
              )}
            >
              <Icon
                className={cn("w-6 h-6 mb-0.5", isActive && "stroke-[2.5px]")}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
