import { getSubjectDeepDive } from '@/lib/database/parties/subjects/getSubjectDeepDive';
import { NextRequest, NextResponse } from 'next/server';
import { resolveLegislaturaId } from '@/lib/database/legislaturas/getLegislaturas';
import { Logger } from 'tslog';

const log = new Logger();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const readyParams = await params;
  const subjectId = parseInt(readyParams.id, 10);

  if (isNaN(subjectId)) {
    return NextResponse.json({ error: 'Invalid subject ID' }, { status: 400 });
  }

  try {
    const { data, error } = await getSubjectDeepDive(subjectId, await resolveLegislaturaId(request));
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    log.error('Error fetching subject deep dive:', error);
    return NextResponse.json(
      { success: false, message: 'Getting tema deep dive failed' },
      { status: 500 }
    );
  }
}
