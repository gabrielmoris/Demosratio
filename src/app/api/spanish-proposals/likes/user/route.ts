import { fetchUserLikesAndDislikes } from '@/lib/database/likes/getUserLikesAndDislikes';
import { requireAuth } from '@/src/middleware/requireAuth';
import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';

const log = new Logger();

export async function POST(req: NextRequest) {
 try {
 const authResult = await requireAuth(req);
 if (authResult instanceof NextResponse) return authResult;

 const { id: userId } = authResult.user;
 const { proposal_id } = await req.json();

 if (!proposal_id) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

 const { result, error } = await fetchUserLikesAndDislikes(proposal_id, userId);

 if (error) {
 log.error('Supabase error fetching likes and dislikes:', error);
 return NextResponse.json({ error: 'Error fetching likes and dislikes' }, { status: 500 });
 }

 return NextResponse.json(result);
 } catch (error) {
 log.error('Error fetching likes and dislikes:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
