import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';
import { isAuthorized } from '@/src/middleware/isAuthorized';
import { fetchCampaignById } from '@/lib/database/parties/campaigns/getCampaignById';
import { fetchAllsubjects } from '@/lib/database/parties/subjects/getAllSubjects';
import { fetchCampaignPdf, PdfFetchError } from '@/lib/services/ai/fetchCampaignPdf';
import { extractPromisesFromPdf } from '@/lib/services/ai/extractPromisesAI';

const log = new Logger();

// Downloading a long program and letting Gemini read it can take a while.
export const maxDuration = 300;

const PDF_ERROR_STATUS = { INVALID_URL: 400, NOT_PDF: 422, TOO_LARGE: 413, DOWNLOAD_FAILED: 502 } as const;

/** Reads the campaign's PDF link and returns AI-drafted promises (max 5 per subject). Nothing is saved. */
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

    const { subjects } = await fetchAllsubjects();
    if (!subjects?.length) {
      return NextResponse.json({ error: 'There are no subjects to classify promises into' }, { status: 500 });
    }

    const { base64 } = await fetchCampaignPdf(campaign.campaign_pdf_url);
    const extraction = await extractPromisesFromPdf(base64, subjects);

    return NextResponse.json(extraction, { status: 200 });
  } catch (error) {
    if (error instanceof PdfFetchError) {
      log.warn(`Campaign PDF rejected (${error.code}):`, error.message);
      return NextResponse.json({ error: error.message, code: error.code }, { status: PDF_ERROR_STATUS[error.code] });
    }
    log.error('Error extracting promises:', error);
    return NextResponse.json(
      { error: 'The AI could not extract promises from this PDF. Try again later.', code: 'AI_FAILED' },
      { status: 502 }
    );
  }
}
