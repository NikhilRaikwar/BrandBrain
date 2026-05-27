import { NextResponse } from "next/server";
import { getCurrentUser, getUserBrain } from "@/lib/brain";
import { getAnalyticsData } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brain = await getUserBrain(user.id);
    const data = await getAnalyticsData(brain?.id ?? null);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analytics failed" },
      { status: 500 }
    );
  }
}
