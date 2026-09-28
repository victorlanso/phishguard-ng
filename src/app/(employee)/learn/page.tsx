"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

const MODULES = [
  {
    id: "1",
    title: "Recognising BEC Attacks",
    duration: "3 min",
    completed: true,
  },
  {
    id: "2",
    title: "WhatsApp & SMS Scams",
    duration: "2 min",
    completed: true,
  },
  {
    id: "3",
    title: "Fake Tax & Government Messages",
    duration: "3 min",
    completed: false,
  },
  {
    id: "4",
    title: "Supplier Invoice Fraud",
    duration: "4 min",
    completed: false,
  },
  {
    id: "5",
    title: "How to Verify Requests Safely",
    duration: "3 min",
    completed: false,
  },
];

export default function LearnPage() {
  const [modules, setModules] = useState(MODULES);

  const markComplete = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: true } : m))
    );
    toast.success("+10 points earned!");
  };

  const completedCount = modules.filter((m) => m.completed).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Learning Path</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {completedCount} of {modules.length} modules completed
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div
          className="bg-brand-600 h-2.5 rounded-full transition-all"
          style={{
            width: `${(completedCount / modules.length) * 100}%`,
          }}
        />
      </div>

      <div className="space-y-3">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3"
          >
            {mod.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
            ) : (
              <Circle className="w-6 h-6 text-slate-300 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 truncate">
                {mod.title}
              </h3>
              <p className="text-xs text-slate-500">{mod.duration}</p>
            </div>

            {!mod.completed && (
              <Button size="sm" onClick={() => markComplete(mod.id)}>
                Start
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
