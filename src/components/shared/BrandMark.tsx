"use client";

import Image from "next/image";

type BrandMarkProps = {
  size?: number;
  showName?: boolean;
};

export function BrandMark({ size = 36, showName = true }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative overflow-hidden rounded-[10px] border border-[rgba(26,21,16,0.08)] bg-[var(--cream2)]"
        style={{ width: size, height: size }}
      >
        <Image src="/brandbrainlogo.png" alt="BrandBrain logo" fill sizes={`${size}px`} priority />
      </div>
      {showName ? (
        <div>
          <div className="font-display text-xl font-bold text-[var(--ink)] leading-none">BrandBrain</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--ink4)]">Company Brain</div>
        </div>
      ) : null}
    </div>
  );
}
