import { fetchAllLikesAndDislikes } from "@/lib/database/likes/getTotalLikesAndDislikes";
import { verifyJWT } from "@/lib/helpers/users/jwt";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function POST(request: Request) {
  const { proposal_id } = await request.json();
  const session = (await cookies()).get("session")?.value;
  if (!session) return NextResponse.json({ error: "Invalid User" }, { status: 400 });
  const userPayload = verifyJWT(session);
  if (!userPayload) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  const { id: userId } = userPayload;

  if (!proposal_id) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    // Count likes and delete them if it was already liked
    const { count: dislikesCount, error: dislikesError } = await supabaseAdmin
      .from("proposal_dislikes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id)
      .eq("user_id", userId);

    if (dislikesError) {
      log.error("Supabase error fetching likes:", dislikesError);
      return NextResponse.json({ error: "Error fetching likes" }, { status: 500 });
    }

    if (dislikesCount && dislikesCount > 0) {
      const { error: dislikedDeleteError } = await supabaseAdmin.from("proposal_dislikes").delete().eq("user_id", userId).select("id").single();

      if (dislikedDeleteError) {
        log.error("Supabase error deleting likes:", dislikedDeleteError);
        return NextResponse.json({ error: "Error deleting likes" }, { status: 500 });
      }
    } else {
      const { error: dislikedAddedError } = await supabaseAdmin
        .from("proposal_dislikes")
        .insert([
          {
            user_id: userId,
            proposal_id,
          },
        ])
        .select("id")
        .single();

      if (dislikedAddedError) {
        log.error("Supabase error adding likes:", dislikedAddedError);
        return NextResponse.json({ error: "Error adding likes" }, { status: 500 });
      }
    }

    // Count dislikes and delete them if it was already disliked

    const { count: likesCount, error: likesError } = await supabaseAdmin
      .from("proposal_likes")
      .select("*", { count: "exact" })
      .eq("proposal_id", proposal_id)
      .eq("user_id", userId);

    if (likesError) {
      log.error("Supabase error fetching likes:", likesError);
      return NextResponse.json({ error: "Error fetching likes" }, { status: 500 });
    }

    if (likesCount && likesCount > 0) {
      const { error: likedDeleteError } = await supabaseAdmin.from("proposal_likes").delete().eq("user_id", userId).select("id").single();

      if (likedDeleteError) {
        log.error("Supabase error deleting dislikes:", likedDeleteError);
        return NextResponse.json({ error: "Error deleting likes" }, { status: 500 });
      }
    }

    const { result, error } = await fetchAllLikesAndDislikes(proposal_id);

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
