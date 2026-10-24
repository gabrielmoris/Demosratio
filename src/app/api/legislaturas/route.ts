import { NextRequest, NextResponse } from 'next/server';
import { Logger } from 'tslog';
import { isAuthorized } from '@/src/middleware/isAuthorized';
import {
  fetchCurrentLegislaturaId,
  fetchLegislaturas,
} from '@/lib/database/legislaturas/getLegislaturas';
import {
  deleteLegislatura,
  saveLegislatura,
  updateLegislatura,
} from '@/lib/database/legislaturas/manageLegislaturas';
import { parseLegislatura } from '@/lib/helpers/legislatura';
import { LegislaturaInput } from '@/types/legislatura';

const log = new Logger();

// Postgres error codes returned by Supabase
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

const pgCode = (error: unknown) => (error as { code?: string })?.code;

const badRequest = () => NextResponse.json({ error: 'Bad Request' }, { status: 400 });

/** Empty -> null, "YYYY-MM-DD" -> itself, anything else -> undefined (invalid). */
const parseDate = (value: unknown): string | null | undefined => {
  if (value === undefined || value === null || value === '') return null;
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value))
    ? value
    : undefined;
};

/** Validates { id, election_date, start_date, end_date }. Returns null when invalid. */
function parseLegislaturaBody(body: Record<string, unknown> | null): LegislaturaInput | null {
  const id = parseLegislatura(body?.id as string | number | undefined);
  const election_date = parseDate(body?.election_date);
  const start_date = parseDate(body?.start_date);
  const end_date = parseDate(body?.end_date);

  if (!id || election_date === undefined || start_date === undefined || end_date === undefined) {
    return null;
  }
  if (start_date && end_date && end_date < start_date) return null;

  return { id, election_date, start_date, end_date };
}

export async function GET() {
  try {
    const legislaturas = await fetchLegislaturas();
    return NextResponse.json(legislaturas);
  } catch (error) {
    log.error('Error fetching legislaturas:', error);
    return NextResponse.json(
      { success: false, message: 'Getting legislaturas failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const input = parseLegislaturaBody(await req.json());
  if (!input) return badRequest();

  try {
    const { id } = await saveLegislatura(input);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (pgCode(error) === UNIQUE_VIOLATION) {
      return NextResponse.json(
        { error: 'This legislatura already exists', code: 'DUPLICATE_LEGISLATURA' },
        { status: 409 }
      );
    }
    log.error('Error saving legislatura:', error);
    return NextResponse.json(
      { success: false, message: 'Saving legislatura failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const input = parseLegislaturaBody(await req.json());
  if (!input) return badRequest();

  try {
    const { id } = await updateLegislatura(input);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    log.error('Error updating legislatura:', error);
    return NextResponse.json(
      { success: false, message: 'Updating legislatura failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: rawId } = await req.json();
  const id = parseLegislatura(rawId);
  if (!id) return badRequest();

  try {
    if (id === (await fetchCurrentLegislaturaId())) {
      return NextResponse.json(
        {
          error: 'The current legislatura cannot be deleted. Make another one current first.',
          code: 'LEGISLATURA_IS_CURRENT',
        },
        { status: 409 }
      );
    }

    await deleteLegislatura(id);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    if (pgCode(error) === FOREIGN_KEY_VIOLATION) {
      return NextResponse.json(
        {
          error: 'This legislatura still has parties or votes.',
          code: 'LEGISLATURA_IN_USE',
        },
        { status: 409 }
      );
    }
    log.error('Error deleting legislatura:', error);
    return NextResponse.json(
      { success: false, message: 'Deleting legislatura failed' },
      { status: 500 }
    );
  }
}
