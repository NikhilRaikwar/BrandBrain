"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { toast } from "sonner";

const sourceTypes = [
  { value: "campaign", label: "Campaign" },
  { value: "brand_guide", label: "Brand Guide" },
  { value: "brief", label: "Brief" },
  { value: "performance_data", label: "Performance Data" },
] as const;

type SourceType = (typeof sourceTypes)[number]["value"];

export function IngestForm({ brainId }: { brainId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>("campaign");
  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const readFile = async (file: File) => {
    const text = await file.text();
    setContent(text);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) await readFile(file);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brainId, sourceType, clientName, title, content }),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      toast.error(payload.error ?? "Failed to process document");
      return;
    }
    toast.success(`✅ ${payload.count} concepts extracted and added to brain`);
    setClientName("");
    setTitle("");
    setContent("");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {sourceTypes.map((item) => {
          const active = sourceType === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setSourceType(item.value)}
              className={
                active
                  ? "rounded-full border border-[var(--accent)] bg-[rgba(0,229,160,0.16)] px-4 py-2 text-xs text-[var(--white)] transition"
                  : "rounded-full border border-[var(--border)] bg-white/5 px-4 py-2 text-xs text-[var(--muted)] transition hover:text-[var(--white)]"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <label className="block space-y-2 text-sm text-[var(--muted)]">
        <span>Client name</span>
        <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
      </label>

      <label className="block space-y-2 text-sm text-[var(--muted)]">
        <span>Document title</span>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label className="block space-y-2 text-sm text-[var(--muted)]">
        <span>Content</span>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste campaign copy, brand guidelines, meeting notes..."
          className="min-h-[300px]"
          required
        />
      </label>

      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) await readFile(file);
        }}
      />

      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-[var(--border)] bg-white/[0.03] px-4 py-5 text-sm text-[var(--muted)] transition hover:bg-white/5"
      >
        <span>Drop .txt or .md file</span>
        <span className="flex items-center gap-2 text-[var(--white)]">
          <Upload className="h-4 w-4" /> Upload file
        </span>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        <Upload className="h-4 w-4" />
        {loading ? "Extracting concepts..." : "Add to Brain"}
      </Button>
    </form>
  );
}
