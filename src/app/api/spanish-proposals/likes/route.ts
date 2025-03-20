import { fetchAllLikesAndDislikes } from "@/lib/database/likes/getTotalLikesAndDislikes";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { proposal_id } = await request.json();

  if (!proposal_id) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const { result, error } = await fetchAllLikesAndDislikes(proposal_id);

    if (error) {
      console.error("Supabase error fetching likes and dislikes:", error);
      return NextResponse.json(
        { error: "Error fetching dislikes" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching likes and dislikes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
