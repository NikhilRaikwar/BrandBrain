"use client";

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

export function IngestForm({ brainId }: { brainId: string | null }) {
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
    setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await readFile(file);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brainId, sourceType, clientName, title, content }),
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Failed to process document");
        return;
      }

      toast.success(`✅ ${payload.count} concepts extracted`);
      setClientName("");
      setTitle("");
      setContent("");
      setSourceType("campaign");
      if (fileRef.current) fileRef.current.value = "";

      if (!brainId && payload.brain_id) {
        router.push(`/dashboard?brain=${payload.brain_id}`);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Failed to process document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="pill-bar">
        {sourceTypes.map((item) => {
          const active = sourceType === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setSourceType(item.value)}
              className={active ? "pill active" : "pill"}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="form-group">
        <label className="form-label">Client Name</label>
        <input
          className="form-input"
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          placeholder="e.g. Client name"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Document Title</label>
        <input
          className="form-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Summer Launch Campaign"
          required
        />
      </div>

      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Content</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: 200 }}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Paste campaign copy, brand guidelines, meeting notes, performance data..."
          required
        />
      </div>

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
        className="upload-zone"
        style={{ marginBottom: 14 }}
      >
        <span style={{ fontSize: 18 }}>📎</span>
        <br />
        Drop .txt or .md file here, or click to upload
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={loading}
      >
        {loading ? "Extracting..." : brainId ? "Add to Brain" : "Create Brain & Add"}
      </button>
    </form>
  );
}
