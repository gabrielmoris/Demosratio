import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';
import { getProposalById } from '@/lib/database/spanishParliament/getProposalById';

const log = new Logger();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
  const readyParams = await params;
  const id = readyParams.id;

  if (!id) {
    return NextResponse.json({ error: 'Proposal ID is required.' }, { status: 400 });
  }

  try {
    const proposal = await getProposalById(id);
    return NextResponse.json(proposal, { status: 200 });
  } catch (error) {
    log.error('Error fetching proposal:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
