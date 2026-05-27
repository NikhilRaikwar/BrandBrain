"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("brain", value);
    else params.delete("brain");
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    router.refresh();
  };

  if (brains.length <= 1) return null;

  return (
    <label className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink3)] shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink4)]">
        Brain
      </span>
      <select
        value={selectedBrainId}
        onChange={(event) => handleChange(event.target.value)}
        className="bg-transparent text-sm text-[var(--ink)] outline-none"
      >
        {brains.map((brain) => (
          <option key={brain.id} value={brain.id}>
            {brain.name}
          </option>
        ))}
      </select>
    </label>
  );
}
