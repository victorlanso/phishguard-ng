"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SimulationLandingPage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function recordClick() {
      try {
        const res = await fetch(`/api/sim/${token}`, { method: "POST" });
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Invalid or expired simulation link");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Click recorded");
      } catch {
        setStatus("error");
        setMessage("Something went wrong");
      }
    }

    if (token) recordClick();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-5 text-center">
          <ShieldAlert className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-xl font-bold">This was a Phishing Simulation</h1>
          <p className="text-red-100 text-sm mt-1">
            You clicked on a test link created by your organisation
          </p>
        </div>

        <div className="p-6 space-y-5">
          {status === "loading" && (
            <p className="text-center text-slate-500">Recording your interaction...</p>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Interaction recorded. Good job opening this page!</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg p-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-slate-900 mb-2">What just happened?</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              The message you received was a <strong>controlled phishing simulation</strong> 
              created by your security team. No real damage was done. The goal is to help 
              everyone get better at spotting real attacks.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 mb-2">What to look out for next time</h2>
            <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Urgent requests for money or sensitive information</li>
              <li>Strange sender addresses or WhatsApp numbers</li>
              <li>Links that don’t match official websites</li>
              <li>Pressure to act immediately without verification</li>
            </ul>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 text-center">
            <p className="text-sm text-brand-800 font-medium">
              Best action: Always <strong>report</strong> suspicious messages instead of clicking.
            </p>
          </div>

          <Link href="/report" className="block">
            <Button className="w-full" size="lg">
              Report a Real Suspicious Message
            </Button>
          </Link>

          <Link href="/" className="block text-center text-sm text-slate-500 hover:text-brand-600">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
