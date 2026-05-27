"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type EditableFieldProps = {
  brainId: string;
  field: "name" | "description";
  value: string;
  multiline?: boolean;
  className?: string;
  buttonLabel?: string;
};

export function EditableField({
  brainId,
  field,
  value,
  multiline,
  className,
  buttonLabel = "Save",
}: EditableFieldProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("brains").update({ [field]: draft }).eq("id", brainId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    setEditing(false);
    router.refresh();
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={className ?? "text-left transition hover:opacity-80"}
      >
        {value || (multiline ? "Click to add description" : "Click to edit")}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-[9px] border border-[var(--border)] bg-white p-3">
      {multiline ? (
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-[120px]" />
      ) : (
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} />
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving..." : buttonLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setDraft(value);
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
