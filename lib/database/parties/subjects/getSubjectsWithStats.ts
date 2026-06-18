import { Logger } from "tslog";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { SubjectWithStats } from "@/types/temas";

const log = new Logger();

export async function getSubjectsWithStats(): Promise<{ subjects: SubjectWithStats[] | null; error?: Error }> {
  try {
    const { data: subjects, error: subjectsError } = await supabaseAdmin
      .from("subjects")
      .select("*")
      .order("name", { ascending: true });

    if (subjectsError) throw subjectsError;
    if (!subjects) return { subjects: [] };

    const { data: promises, error: promisesError } = await supabaseAdmin
      .from("promises")
      .select("id, subject_id, party_id");

    if (promisesError) throw promisesError;

    type RawPromiseRow = { id: number; subject_id: number; party_id: number };
    type RawSubjectRow = { id: number; created_at: Date; name: string; description: string };

    const groupedBySubject: Record<number, { count: number; partyIds: Set<number> }> = {};
    (promises || []).forEach((p: RawPromiseRow) => {
      if (!groupedBySubject[p.subject_id]) {
        groupedBySubject[p.subject_id] = { count: 0, partyIds: new Set() };
      }
      groupedBySubject[p.subject_id].count++;
      groupedBySubject[p.subject_id].partyIds.add(p.party_id);
    });

    const subjectsWithStats: SubjectWithStats[] = (subjects as unknown as RawSubjectRow[]).map((subject) => ({
      ...subject,
      totalPromises: groupedBySubject[subject.id]?.count || 0,
      totalParties: groupedBySubject[subject.id]?.partyIds.size || 0,
    }));

    return { subjects: subjectsWithStats };
  } catch (error) {
    log.error("Error fetching subjects with stats:", error);
    return { subjects: null, error: error as Error };
  }
}
