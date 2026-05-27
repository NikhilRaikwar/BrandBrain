"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

type BrainOption = {
  id: string;
  name: string;
};

export function BrainSelector({
  brains,
  selectedBrainId,
}: {
  brains: BrainOption[];
  selectedBrainId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selectedBrain = useMemo(
    () => brains.find((brain) => brain.id === selectedBrainId) ?? brains[0] ?? null,
    [brains, selectedBrainId]
  );

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("brain", value);
    else params.delete("brain");
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    router.refresh();
    setOpen(false);
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (brains.length <= 1) return null;

  return (
    <div ref={rootRef} style={{ position: "relative", minWidth: 220 }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "linear-gradient(180deg, #ffffff 0%, #fbf7ee 100%)",
          border: "1px solid rgba(26, 21, 16, 0.10)",
          borderRadius: 999,
          padding: "10px 14px",
          fontSize: 13,
          color: "var(--ink)",
          boxShadow: "0 10px 24px rgba(26, 21, 16, 0.08)",
          cursor: "pointer",
        }}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink4)] shrink-0">
            Brain
          </span>
          <span className="truncate text-[14px] font-medium text-[var(--ink)]">
            {selectedBrain?.name ?? "Select brain"}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--ink4)] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Select brain"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "100%",
            zIndex: 30,
            borderRadius: 18,
            border: "1px solid rgba(26, 21, 16, 0.10)",
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 24px 48px rgba(26, 21, 16, 0.14)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
          }}
        >
          {brains.map((brain) => {
            const active = brain.id === selectedBrainId;
            return (
              <button
                key={brain.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleChange(brain.id)}
                className="w-full text-left"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  background: active ? "rgba(26, 107, 60, 0.08)" : "transparent",
                  color: "var(--ink)",
                  borderBottom: "1px solid rgba(26, 21, 16, 0.06)",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{brain.name}</span>
                {active ? <Check className="h-4 w-4 text-[var(--green)]" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
