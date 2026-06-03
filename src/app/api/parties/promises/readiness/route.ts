import { getPromisesReadiness } from '@/lib/database/parties/promises/promise-readiness/getPromisesReadiness';
import { getuserPromisesReadiness } from '@/lib/database/parties/promises/promise-readiness/getUSerPromisesReadiness';
import { setPromisesReadiness } from '@/lib/database/parties/promises/promise-readiness/setPromisesReadiness';
import { updatePromisesReadiness } from '@/lib/database/parties/promises/promise-readiness/updatePromisesReadiness';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/middleware/requireAuth';
import { Logger } from 'tslog';

const log = new Logger();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaign_id = Number(searchParams.get('campaign_id'));

  if (!campaign_id) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const readiness = await getPromisesReadiness(campaign_id);
    return NextResponse.json(readiness);
  } catch (error) {
    log.error('Error getting readiness data:', error);
    return NextResponse.json(
      { success: false, message: 'Getting readiness data failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { user_id } = authResult.user;
  const { readiness_score, campaign_id } = await req.json();

  if (!readiness_score || !campaign_id) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const { readiness } = await getuserPromisesReadiness(campaign_id, user_id);

    if (readiness?.id) {
      const id = await updatePromisesReadiness(campaign_id, user_id, parseFloat(readiness_score));
      return NextResponse.json(id, { status: 201 });
    }

    const id = await setPromisesReadiness(campaign_id, user_id, parseFloat(readiness_score));

    return NextResponse.json(id, { status: 201 });
  } catch (error) {
    log.error('Error saving readiness data:', error);
    return NextResponse.json(
      { success: false, message: 'Saving readiness data failed' },
      { status: 500 }
    );
  }
}
