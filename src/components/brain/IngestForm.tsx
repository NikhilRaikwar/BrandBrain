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
  const [showNameInput, setShowNameInput] = useState(false);
  const [newBrainName, setNewBrainName] = useState("");
  const [creatingBrain, setCreatingBrain] = useState(false);

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

  const handleCreateBrain = async () => {
    if (creatingBrain || loading) return;
    setCreatingBrain(true);

    try {
      const response = await fetch("/api/brain/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrainName.trim() }),
      });
      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error ?? "Failed to create brain");
        return;
      }

      toast.success(`Created ${payload.name}`);
      setShowNameInput(false);
      setNewBrainName("");
      router.replace(`/ingest?brain=${payload.brain_id}`);
      router.refresh();
    } catch {
      toast.error("Failed to create brain");
    } finally {
      setCreatingBrain(false);
    }
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
      <div className="mb-4 rounded-[16px] border border-[rgba(26,21,16,0.10)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,240,225,0.92))] px-4 py-4 shadow-[0_14px_40px_rgba(26,21,16,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--ink4)]">
              Need another workspace?
            </div>
            <div className="mt-1 text-[13px] leading-6 text-[var(--ink3)]">
              Name the brain first, then we’ll create it and send you into that workspace.
            </div>
          </div>
          {!showNameInput ? (
            <button
              type="button"
              onClick={() => setShowNameInput(true)}
              disabled={creatingBrain || loading}
              className="btn btn-outline btn-sm"
            >
              New Brain
            </button>
          ) : null}
        </div>

        {showNameInput ? (
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              className="form-input"
              style={{ flex: 1, minWidth: 240 }}
              value={newBrainName}
              onChange={(event) => setNewBrainName(event.target.value)}
              placeholder="e.g. Nike Client Brain"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleCreateBrain();
                }
              }}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={handleCreateBrain} disabled={creatingBrain}>
              {creatingBrain ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setShowNameInput(false);
                setNewBrainName("");
              }}
              disabled={creatingBrain}
            >
              Cancel
            </button>
          </div>
        ) : null}
      </div>

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
