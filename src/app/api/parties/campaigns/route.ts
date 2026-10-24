import { deleteCampaign } from '@/lib/database/parties/campaigns/deleteCampaign';
import { fetchAllCampaigns } from '@/lib/database/parties/campaigns/getAllCampagns';
import { fetchCampaign } from '@/lib/database/parties/campaigns/getCampaign';
import { saveCampaign } from '@/lib/database/parties/campaigns/saveCampaign';
import { updateCampaign } from '@/lib/database/parties/campaigns/updateCampaign';
import { parseLegislatura } from '@/lib/helpers/legislatura';
import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '@/src/middleware/isAuthorized';
import { Logger } from 'tslog';

const log = new Logger();

const pgCode = (error: unknown) => (error as { code?: string })?.code;

/** `?party_id=1` campaigns of a party, only the one of `&legislatura=16` when given. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const party_id = Number(searchParams.get('party_id'));
    const legislaturaId = parseLegislatura(searchParams.get('legislatura')) ?? undefined;

    if (party_id && !isNaN(party_id)) {
      const { campaignsOfParty } = await fetchCampaign(party_id, legislaturaId);
      return NextResponse.json(campaignsOfParty);
    } else {
      const { campaigns } = await fetchAllCampaigns();
      return NextResponse.json(campaigns);
    }
  } catch (error) {
    log.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'Getting Campaign data failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { year, party_id, campaign_pdf_url, legislatura_id } = await req.json();
  const legislaturaId = parseLegislatura(legislatura_id);

  if (!year || !party_id || !campaign_pdf_url?.trim() || !legislaturaId) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const { id } = await saveCampaign(
      Number(year),
      Number(party_id),
      campaign_pdf_url.trim(),
      legislaturaId
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (pgCode(error) === '23505') {
      return NextResponse.json(
        {
          error: 'This party is already in this legislatura',
          code: 'PARTY_ALREADY_IN_LEGISLATURA',
        },
        { status: 409 }
      );
    }
    log.error('Error saving campaign:', error);
    return NextResponse.json(
      { success: false, message: 'Saving Campaign data failed' },
      { status: 500 }
    );
  }
}

/** Edits the year and PDF of a campaign: `{ campaign_id, year, campaign_pdf_url }`. */
export async function PATCH(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { campaign_id, year, campaign_pdf_url } = await req.json();

  if (!campaign_id || !Number(year) || !campaign_pdf_url?.trim()) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const { id } = await updateCampaign(Number(campaign_id), Number(year), campaign_pdf_url.trim());
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    log.error('Error updating campaign:', error);
    return NextResponse.json(
      { success: false, message: 'Updating Campaign data failed' },
      { status: 500 }
    );
  }
}

/** Deleting a campaign removes its party from that legislatura. */
export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { campaign_id } = await req.json();

  if (!campaign_id) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const { id } = await deleteCampaign(campaign_id);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    if (pgCode(error) === '23503') {
      return NextResponse.json(
        {
          error: 'This campaign still has promises or user ratings. Delete its promises first.',
          code: 'CAMPAIGN_IN_USE',
        },
        { status: 409 }
      );
    }
    log.error('Error deleting campaign:', error);
    return NextResponse.json(
      { success: false, message: 'Deleting Campaign data failed' },
      { status: 500 }
    );
  }
}
