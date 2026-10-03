"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type ContentItem = {
  id: string;
  type: string;
  language: string;
  title: string;
  body: string;
  options: string[] | null;
  correct_answer: string | null;
  tags: string[] | null;
  active: boolean;
  created_at: string;
};

const emptyForm = {
  type: "tip",
  language: "en",
  title: "",
  body: "",
  options: "",
  correct_answer: "",
  tags: "",
  active: true,
};

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const supabase = createClient();

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type || "tip",
      language: item.language || "en",
      title: item.title || "",
      body: item.body || "",
      options: item.options ? item.options.join("\n") : "",
      correct_answer: item.correct_answer || "",
      tags: item.tags ? item.tags.join(", ") : "",
      active: item.active ?? true,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    setSaving(true);

    const payload = {
      type: form.type,
      language: form.language,
      title: form.title.trim(),
      body: form.body.trim(),
      options:
        form.type === "quiz" && form.options.trim()
          ? form.options
              .split("\n")
              .map((o) => o.trim())
              .filter(Boolean)
          : null,
      correct_answer:
        form.type === "quiz" ? form.correct_answer.trim() || null : null,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : null,
      active: form.active,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("content_items")
        .update(payload)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase.from("content_items").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editingId ? "Updated successfully" : "Created successfully");
    setShowForm(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;

    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Deleted");
    fetchItems();
  };

  const toggleActive = async (item: ContentItem) => {
    const { error } = await supabase
      .from("content_items")
      .update({ active: !item.active })
      .eq("id", item.id);

    if (error) {
      toast.error(error.message);
      return;
    }
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Content" : "New Content"}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm"
                >
                  <option value="tip">Tip</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div>
                <Label>Language</Label>
                <select
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                  className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm"
                >
                  <option value="en">English</option>
                  <option value="pcm">Pidgin</option>
                  <option value="yo">Yoruba</option>
                  <option value="ha">Hausa</option>
                  <option value="ig">Igbo</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Title</Label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm"
                placeholder="e.g. WhatsApp Boss Scam"
              />
            </div>

            <div>
              <Label>Body</Label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="The main content of the tip or question..."
              />
            </div>

            {form.type === "quiz" && (
              <>
                <div>
                  <Label>Options (one per line)</Label>
                  <textarea
                    value={form.options}
                    onChange={(e) =>
                      setForm({ ...form, options: e.target.value })
                    }
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder={"Option A\nOption B\nOption C\nOption D"}
                  />
                </div>
                <div>
                  <Label>Correct Answer</Label>
                  <input
                    value={form.correct_answer}
                    onChange={(e) =>
                      setForm({ ...form, correct_answer: e.target.value })
                    }
                    className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm"
                    placeholder="Exact text of the correct option"
                  />
                </div>
              </>
            )}

            <div>
              <Label>Tags (comma separated)</Label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="mt-1 w-full h-10 rounded-lg border border-slate-300 px-3 text-sm"
                placeholder="whatsapp, bec, phishing"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No content yet. Click “Add Content” to create your first tip or quiz.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        item.type === "quiz"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400 uppercase">
                      {item.language}
                    </span>
                    {!item.active && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900 truncate">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">
                    {item.body}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(item)}
                    className="text-xs px-2 py-1 rounded hover:bg-slate-100 text-slate-600"
                    title={item.active ? "Deactivate" : "Activate"}
                  >
                    {item.active ? "On" : "Off"}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 rounded hover:bg-slate-100 text-slate-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded hover:bg-red-50 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
