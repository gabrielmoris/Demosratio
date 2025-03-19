import { verifyJWT } from "@/lib/helpers/users/jwt";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface LikesAndDislikes {
  likes: number;
  dislikes: number;
  proposal_id: number;
}

export async function POST(request: Request) {
  const { proposal_id } = await request.json();
  const session = (await cookies()).get("session")?.value;
  if (!session) return NextResponse.json({ error: "Invalid User" }, { status: 400 });
  const userPayload = verifyJWT(session);
  if (!userPayload) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  const { id: userId } = userPayload;

  if (!proposal_id) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  try {
    // Count likes
    const { count: likesCount, error: likesError } = await supabaseAdmin
      .from("proposal_likes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id)
      .eq("user_id", userId);

    if (likesError) {
      console.error("Supabase error fetching likes:", likesError);
      return NextResponse.json({ error: "Error fetching likes" }, { status: 500 });
    }

    // Count dislikes
    const { count: dislikesCount, error: dislikesError } = await supabaseAdmin
      .from("proposal_dislikes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id)
      .eq("user_id", userId);

    if (dislikesError) {
      console.error("Supabase error fetching dislikes:", dislikesError);
      return NextResponse.json({ error: "Error fetching dislikes" }, { status: 500 });
    }

    const result: LikesAndDislikes = {
      likes: likesCount || 0, // Handle potential null count
      dislikes: dislikesCount || 0, // Handle potential null count
      proposal_id: proposal_id,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching likes and dislikes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
