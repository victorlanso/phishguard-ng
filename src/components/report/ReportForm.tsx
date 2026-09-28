"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Send } from "lucide-react";

export default function ReportForm() {
  const [source, setSource] = useState("whatsapp");
  const [messageText, setMessageText] = useState("");
  const [suspectedType, setSuspectedType] = useState("bec");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast.error("Please describe or paste the suspicious message");
      return;
    }

    setLoading(true);

    try {
      let screenshotUrl: string | undefined;

      // Upload screenshot first if present
      if (screenshot) {
        const formData = new FormData();
        formData.append("file", screenshot);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Failed to upload screenshot");
        }

        const uploadData = await uploadRes.json();
        screenshotUrl = uploadData.url;
      }

      // Create the report
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          message_text: messageText,
          suspected_type: suspectedType,
          note: note || undefined,
          screenshot_url: screenshotUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }

      toast.success("Report submitted successfully! +10 points");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="source" className="mb-1.5 block">
          Where did you see this?
        </Label>
        <select
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="type" className="mb-1.5 block">
          Suspected Type
        </Label>
        <select
          id="type"
          value={suspectedType}
          onChange={(e) => setSuspectedType(e.target.value)}
          className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="phishing">Phishing</option>
          <option value="bec">Business Email Compromise (BEC)</option>
          <option value="smishing">SMS / WhatsApp Scam</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="message" className="mb-1.5 block">
          Message / Description *
        </Label>
        <textarea
          id="message"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Paste the message or describe what you saw..."
          rows={5}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <div>
        <Label className="mb-1.5 block">Screenshot (optional)</Label>
        <label className="flex items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors">
          <Upload className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-500">
            {screenshot ? screenshot.name : "Tap to upload screenshot"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      <div>
        <Label htmlFor="note" className="mb-1.5 block">
          Additional Note (optional)
        </Label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any extra context..."
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          "Submitting..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Report Suspicious Message
          </>
        )}
      </Button>
    </form>
  );
}
