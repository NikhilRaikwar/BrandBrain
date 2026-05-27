import { NextResponse } from "next/server";
import { createUserBrain, getCurrentUser, getUserBrains } from "@/lib/brain";

export const dynamic = "force-dynamic";

function nextBrainName(existingCount: number) {
  return `Brain #${existingCount + 1}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingBrains = await getUserBrains(user.id);
    const name = String(body.name ?? "").trim() || nextBrainName(existingBrains.length);
    const brain = await createUserBrain(user.id, name);

    return NextResponse.json(
      { brain_id: brain.id, name: brain.name },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create brain" },
      { status: 500 }
    );
  }
}
