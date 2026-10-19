import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';
import { isAuthorized } from '@/src/middleware/isAuthorized';
import { fetchCampaignById } from '@/lib/database/parties/campaigns/getCampaignById';
import { fetchAllsubjects } from '@/lib/database/parties/subjects/getAllSubjects';
import { extractPromisesFromPdf, PdfNotReadError } from '@/lib/services/ai/extractPromisesAI';

const log = new Logger();

export const maxDuration = 300;

const isHttpUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { campaign_id } = await req.json();
  if (!campaign_id) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const campaign = await fetchCampaignById(Number(campaign_id));
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (!isHttpUrl(campaign.campaign_pdf_url)) {
      return NextResponse.json(
        { error: 'The campaign link is not a valid URL', code: 'INVALID_URL' },
        { status: 400 }
      );
    }

    const { subjects } = await fetchAllsubjects();
    if (!subjects?.length) {
      return NextResponse.json(
        { error: 'There are no subjects to classify promises into' },
        { status: 500 }
      );
    }

    const extraction = await extractPromisesFromPdf(campaign.campaign_pdf_url, subjects);

    return NextResponse.json(extraction, { status: 200 });
  } catch (error) {
    if (error instanceof PdfNotReadError) {
      return NextResponse.json({ error: error.message, code: 'PDF_NOT_READ' }, { status: 422 });
    }
    log.error('Error extracting promises:', error);
    return NextResponse.json(
      {
        error: 'The AI could not extract promises from this PDF. Try again later.',
        code: 'AI_FAILED',
      },
      { status: 502 }
    );
  }
}
