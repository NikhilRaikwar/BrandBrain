"use client";

import { EditableField } from "./EditableField";
import { PublicToggle } from "./PublicToggle";
import { Copy, ExternalLink, Linkedin } from "lucide-react";
import { toast } from "sonner";

type ShareWorkspaceProps = {
  brain: {
    id: string;
    name: string;
    description: string | null;
    share_token: string;
    is_public: boolean;
    docs_ingested: number;
    concepts_extracted: number;
    queries_answered: number;
  };
};

export function ShareWorkspace({ brain }: ShareWorkspaceProps) {
  const shareUrl = `https://brandbrain.vercel.app/b/${brain.share_token}`;
  const shareText = [
    `I just shared my BrandBrain, "${brain.name}".`,
    brain.description ? brain.description : "A living memory of how this agency thinks and creates.",
    "",
    `Explore it here: ${shareUrl}`,
    "",
    "Built with BrandBrain to turn campaign history into reusable creative memory.",
  ].join("\n");

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Copied!");
  };

  const openShareUrl = () => {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const shareLinkedIn = async () => {
    await navigator.clipboard.writeText(shareText);
    toast.success("LinkedIn post template copied.");
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="mx-auto w-full max-w-[640px] space-y-4">
      <section className="card card-top-purple">
        <div className="mb-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink4)]">
            Brain Name
          </div>
          <EditableField
            brainId={brain.id}
            field="name"
            value={brain.name}
            className="font-display text-[28px] font-bold text-[var(--ink)]"
          />
        </div>

        <div className="mb-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink4)]">
            Description
          </div>
          <EditableField
            brainId={brain.id}
            field="description"
            value={brain.description ?? ""}
            multiline
            className="text-[14px] leading-7 text-[var(--ink3)]"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[8px] bg-[var(--cream2)] p-3 text-center">
            <div className="font-display text-[26px] text-[var(--ink)]">{brain.docs_ingested}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--ink4)]">Docs</div>
          </div>
          <div className="rounded-[8px] bg-[var(--cream2)] p-3 text-center">
            <div className="font-display text-[26px] text-[var(--ink)]">{brain.concepts_extracted}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--ink4)]">Concepts</div>
          </div>
          <div className="rounded-[8px] bg-[var(--cream2)] p-3 text-center">
            <div className="font-display text-[26px] text-[var(--ink)]">{brain.queries_answered}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--ink4)]">Queries</div>
          </div>
        </div>

        <p className="mt-6 text-[14px] leading-7 text-[var(--ink3)]">
          A living memory of how this agency thinks and creates.
        </p>
      </section>

      <section className="card card-top-green">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink4)]">
          Public Share URL
        </div>
        <div className="share-url-box">{shareUrl}</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copyLink} className="btn btn-primary btn-sm">
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
          <button type="button" onClick={openShareUrl} className="btn btn-outline btn-sm">
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </button>
          <button type="button" onClick={shareLinkedIn} className="btn btn-outline btn-sm">
            <Linkedin className="h-4 w-4" />
            Share on LinkedIn
          </button>
        </div>
      </section>

      <section className="card card-top-orange">
        <div className="toggle-wrap">
          <div>
            <div className="toggle-label">Public Access</div>
            <div className="toggle-sub">Anyone with the link can query this brain.</div>
          </div>
          <PublicToggle brainId={brain.id} value={brain.is_public} />
        </div>
        <div className="border-t border-[var(--border2)] pt-4 text-[13px] leading-7 text-[var(--ink4)]">
          When enabled, anyone with the link can query your brain. All data remains read-only for public users.
        </div>
      </section>
    </div>
  );
}
