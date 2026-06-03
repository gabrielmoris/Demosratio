import { fetchAllLikesAndDislikes } from '@/lib/database/likes/getTotalLikesAndDislikes';
import { addUserLike } from '@/lib/database/likes/user/addUserLike';
import { deleteUserDislike } from '@/lib/database/likes/user/deleteUserDislike';
import { deleteUserLike } from '@/lib/database/likes/user/deleteUserLike';
import { getUserDislikes } from '@/lib/database/likes/user/getUserDislikes';
import { getUserLikes } from '@/lib/database/likes/user/getUserLikes';
import { requireAuth } from '@/src/middleware/requireAuth';
import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';

const log = new Logger();

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { user_id } = authResult.user;
  const { proposal_id } = await req.json();

  if (!proposal_id) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  try {
    // Count likes and delete them if it was already liked
    const likesCount = await getUserLikes(proposal_id, user_id);

    if (likesCount && likesCount > 0) {
      await deleteUserLike(proposal_id, user_id);
    } else {
      await addUserLike(proposal_id, user_id);
    }

    // Count dislikes and delete them if it was already disliked
    const dislikesCount = await getUserDislikes(proposal_id, user_id);

    if (dislikesCount && dislikesCount > 0) {
      await deleteUserDislike(proposal_id, user_id);
    }

    const { result, error } = await fetchAllLikesAndDislikes(proposal_id);

    if (error) {
      log.error('Supabase error fetching likes and dislikes:', error);
      return NextResponse.json({ error: 'Error fetching dislikes' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    log.error('Error: ', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
