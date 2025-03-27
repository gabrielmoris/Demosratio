import { fetchAllLikesAndDislikes } from "@/lib/database/likes/getTotalLikesAndDislikes";
import { addUserDislike } from "@/lib/database/likes/user/addUserDislike";
import { deleteUserDislike } from "@/lib/database/likes/user/deleteUserDislike";
import { deleteUserLike } from "@/lib/database/likes/user/deleteUserLike";
import { getUserDislikes } from "@/lib/database/likes/user/getUserDislikes";
import { getUserLikes } from "@/lib/database/likes/user/getUserLikes";
import { verifyJWT } from "@/lib/helpers/users/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Logger } from "tslog";

const log = new Logger();

export async function POST(request: Request) {
  const { proposal_id } = await request.json();
  const session = (await cookies()).get("session")?.value;
  if (!session)
    return NextResponse.json({ error: "Invalid User" }, { status: 400 });
  const userPayload = verifyJWT(session);
  if (!userPayload)
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  const { id: userId } = userPayload;

  const user_id = Number(userId);

  if (!proposal_id) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    // Count likes and delete them if it was already liked
    const dislikesCount = await getUserDislikes(proposal_id, user_id);

    if (dislikesCount && dislikesCount > 0) {
      await deleteUserDislike(proposal_id, user_id);
    } else {
      await addUserDislike(proposal_id, user_id);
    }

    // Count dislikes and delete them if it was already disliked

    const likesCount = await getUserLikes(proposal_id, user_id);

    if (likesCount && likesCount > 0) {
      await deleteUserLike(proposal_id, user_id);
    }

    const { result, error } = await fetchAllLikesAndDislikes(proposal_id);

    if (error) {
      log.error("Supabase error fetching likes and dislikes:", error);
      return NextResponse.json(
        { error: "Error fetching dislikes" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    log.error("Error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
