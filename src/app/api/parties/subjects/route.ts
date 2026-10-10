import { deleteSubject } from '@/lib/database/parties/subjects/deleteSubject';
import { fetchAllsubjects } from '@/lib/database/parties/subjects/getAllSubjects';
import { saveSubject } from '@/lib/database/parties/subjects/saveSubject';
import { updateSubject } from '@/lib/database/parties/subjects/updateSubject';
import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '@/src/middleware/isAuthorized';
import { Logger } from 'tslog';

const log = new Logger();

// Postgres error codes returned by Supabase
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

const pgCode = (error: unknown) => (error as { code?: string })?.code;

const duplicateName = () =>
  NextResponse.json({ error: 'A subject with this name already exists', code: 'DUPLICATE_NAME' }, { status: 409 });

export async function GET() {
  try {
    const { subjects } = await fetchAllsubjects();
    return NextResponse.json(subjects);
  } catch (error) {
    log.error('Error fetching subjects:', error);
    return NextResponse.json(
      { success: false, message: 'Getting Subjects data failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, description } = await req.json();

  if (!name?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const { id } = await saveSubject(name.trim(), description.trim());
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (pgCode(error) === UNIQUE_VIOLATION) return duplicateName();
    log.error('Error saving subject:', error);
    return NextResponse.json(
      { success: false, message: 'Saving Subject data failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { subject_id, name, description } = await req.json();

  if (!subject_id || !name?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const { id } = await updateSubject(subject_id, name.trim(), description.trim());
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    if (pgCode(error) === UNIQUE_VIOLATION) return duplicateName();
    log.error('Error updating subject:', error);
    return NextResponse.json(
      { success: false, message: 'Updating Subject data failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { subject_id } = await req.json();

  if (!subject_id) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  try {
    const { id } = await deleteSubject(subject_id);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    // promises.subject_id references subjects(id) without cascade, so the DB blocks deleting a subject in use.
    if (pgCode(error) === FOREIGN_KEY_VIOLATION) {
      return NextResponse.json(
        { error: 'This subject still has promises. Move or delete them first.', code: 'SUBJECT_IN_USE' },
        { status: 409 }
      );
    }
    log.error('Error deleting subject:', error);
    return NextResponse.json(
      { success: false, message: 'Deleting Subject data failed' },
      { status: 500 }
    );
  }
}
