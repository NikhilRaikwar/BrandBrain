"use client";

import { EditableField } from "./EditableField";
import { PublicToggle } from "./PublicToggle";
import { Button } from "@/components/ui/button";
import { Copy, Linkedin } from "lucide-react";
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

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <section className="card card-purple">
        <EditableField
          brainId={brain.id}
          field="name"
          value={brain.name}
          className="font-display text-4xl font-bold text-[var(--white)]"
        />
        <div className="mt-4">
          <EditableField
            brainId={brain.id}
            field="description"
            value={brain.description ?? ""}
            multiline
            className="text-sm text-[var(--muted)]"
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-4">
            <div className="text-2xl font-bold text-[var(--white)]">{brain.docs_ingested}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Docs</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-4">
            <div className="text-2xl font-bold text-[var(--white)]">{brain.concepts_extracted}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Concepts</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/5 p-4">
            <div className="text-2xl font-bold text-[var(--white)]">{brain.queries_answered}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Queries</div>
          </div>
        </div>

        <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
          A living memory of how this agency thinks and creates.
        </p>
      </section>

      <section className="card card-green">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Share URL</div>
        <div className="mt-3 break-all font-body text-sm text-[var(--white)]">{shareUrl}</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={copyLink}>
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            <Linkedin className="h-4 w-4" />
            Share on LinkedIn
          </Button>
        </div>
      </section>

      <section className="card card-orange">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-display text-2xl font-bold text-[var(--white)]">Public access</div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {brain.is_public ? "Anyone with the link can query this brain." : "Only you can access this brain."}
            </p>
          </div>
          <PublicToggle brainId={brain.id} value={brain.is_public} />
        </div>
      </section>
    </div>
  );
}
