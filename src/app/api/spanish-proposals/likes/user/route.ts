import { fetchUserLikesAndDislikes } from "@/lib/database/likes/getUserLikesAndDislikes";
import { verifyJWT } from "@/lib/helpers/users/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function POST(request: Request) {
  try {
    const { proposal_id } = await request.json();
    const session = (await cookies()).get("session")?.value;
    if (!session) return NextResponse.json({ error: "Invalid User" }, { status: 400 });
    const userPayload = verifyJWT(session);
    if (!userPayload) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    const { id: userId } = userPayload;

    if (!proposal_id) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const { result, error } = await fetchUserLikesAndDislikes(proposal_id, userId);

    if (error) {
      log.error("Supabase error fetching likes and dislikes:", error);
      return NextResponse.json({ error: "Error fetching dislikes" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    log.error("Error fetching likes and dislikes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
