"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_TIPS = [
  {
    id: "1",
    title: "WhatsApp “Boss” Scam",
    body: "If someone claiming to be your boss messages you on WhatsApp asking for an urgent transfer, call them on the number you already know. Never use the number inside the message.",
    bodyPcm:
      "If person wey claim say e be your boss message you for WhatsApp ask for money transfer sharp sharp, call am for the number wey you sabi before you send anything. No use the number wey dey inside the message.",
  },
  {
    id: "2",
    title: "Fake FIRS / Tax Message",
    body: "FIRS will never ask you to click a link and pay tax through a random website. Always go directly to the official FIRS portal yourself.",
    bodyPcm:
      "FIRS no dey ask anybody make dem click link come pay tax for strange website. Always enter the official FIRS website by yourself.",
  },
];

export default function DailyTip() {
  const [tip] = useState(SAMPLE_TIPS[0]);
  const [completed, setCompleted] = useState(false);
  const [showPcm, setShowPcm] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    toast.success("+5 points earned!");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center gap-2 text-white">
        <Lightbulb className="w-5 h-5" />
        <span className="font-semibold">Today’s Security Tip</span>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-slate-900">{tip.title}</h3>
        <p className="text-slate-700 text-[15px] leading-relaxed">
          {showPcm ? tip.bodyPcm : tip.body}
        </p>

        <button
          type="button"
          onClick={() => setShowPcm(!showPcm)}
          className="text-sm text-brand-600 font-medium hover:underline"
        >
          {showPcm ? "Show English" : "Show Pidgin"}
        </button>

        {!completed ? (
          <Button onClick={handleComplete} className="w-full mt-1">
            I Understand – Earn +5 Points
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-600 font-medium py-2.5 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            Completed · +5 points
          </div>
        )}
      </div>
    </div>
  );
}
