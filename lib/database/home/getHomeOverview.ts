import { Temporal } from '@js-temporal/polyfill';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getAllProposals } from '@/lib/database/spanishParliament/getAllProposals';
import { VotingData } from '@/types/proposal';
import { ContradictedPromise, HomeOverview } from '@/types/home';

const LATEST_VOTES = 3;
const TOP_CONTRADICTED = 5;
/** Votes shown per contradicted promise */
const VOTES_PER_PROMISE = 3;
/** The period ends on the last voting day and covers the 29 days before it. Contradictions are rare, so a single period is often empty */
const PERIOD_DAYS = 30;
const PAGE_SIZE = 1000;

async function countVotes(legislaturaId: number, onlyPending = false): Promise<number> {
  let query = supabaseAdmin
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .eq('legislatura_id', legislaturaId);
  if (onlyPending) query = query.eq('promise_analysis_status', 'pending');

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function countPromiseChecks(legislaturaId: number): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('promise_status')
    .select('id, proposals!inner(legislatura_id)', { count: 'exact', head: true })
    .eq('proposals.legislatura_id', legislaturaId);
  if (error) throw error;
  return count ?? 0;
}

/** The 30 days ending on the last day the legislatura voted. */
async function getLastVotingPeriod(legislaturaId: number): Promise<HomeOverview['period']> {
  const { data, error } = await supabaseAdmin
    .from('proposals')
    .select('date')
    .eq('legislatura_id', legislaturaId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.date) return null;

  const to = Temporal.PlainDate.from(String(data.date).slice(0, 10));
  const from = to.subtract({ days: PERIOD_DAYS - 1 });
  return { from: from.toString(), to: to.toString() };
}

type ContradictionRow = {
  promise_id: number;
  promise_text: string;
  party_id: number;
  party_name: string;
  subject_id: number;
  proposal_id: number;
};

/** Promises most contradicted by the votes of the period, most votes first. */
async function getMostContradicted(legislaturaId: number, period: NonNullable<HomeOverview['period']>) {
  const { data: votes, error } = await supabaseAdmin
    .from('proposals')
    .select('id, title, date')
    .eq('legislatura_id', legislaturaId)
    .gte('date', period.from)
    // Whole last day, whatever time the date was saved with
    .lt('date', Temporal.PlainDate.from(period.to).add({ days: 1 }).toString())
    .order('date', { ascending: false });
  if (error) throw error;
  if (!votes?.length) return [];

  const titles = new Map<number, string>(votes.map(v => [v.id, v.title]));
  const rows: ContradictionRow[] = [];

  // Supabase returns at most 1000 rows per request
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error: rowsError } = await supabaseAdmin
      .from('promise_status')
      .select('promise_id, promise_text, party_id, party_name, subject_id, proposal_id')
      .eq('fulfillment_status', 'Contradictory Evidence')
      .in('proposal_id', [...titles.keys()])
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (rowsError) throw rowsError;
    rows.push(...((data ?? []) as ContradictionRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }

  const byPromise = new Map<number, ContradictedPromise>();
  for (const row of rows) {
    const entry = byPromise.get(row.promise_id) ?? {
      promise_id: row.promise_id,
      promise_text: row.promise_text,
      party_id: row.party_id,
      party_name: row.party_name,
      subject_id: row.subject_id,
      count: 0,
      votes: [],
    };
    if (!entry.votes.some(v => v.id === row.proposal_id)) {
      entry.count++;
      entry.votes.push({ id: row.proposal_id, title: titles.get(row.proposal_id) ?? '' });
    }
    byPromise.set(row.promise_id, entry);
  }

  return [...byPromise.values()]
    .sort((a, b) => b.count - a.count || a.party_name.localeCompare(b.party_name) || a.promise_id - b.promise_id)
    .slice(0, TOP_CONTRADICTED)
    .map(p => ({ ...p, votes: p.votes.slice(0, VOTES_PER_PROMISE) }));
}

/** Everything the home page shows for one legislatura. */
export async function getHomeOverview(legislaturaId: number): Promise<HomeOverview> {
  const [totalVotes, pendingVotes, promiseChecks, latest, period] = await Promise.all([
    countVotes(legislaturaId),
    countVotes(legislaturaId, true),
    countPromiseChecks(legislaturaId),
    getAllProposals(1, LATEST_VOTES, legislaturaId),
    getLastVotingPeriod(legislaturaId),
  ]);

  const contradicted = period ? await getMostContradicted(legislaturaId, period) : [];

  return {
    counters: {
      totalVotes,
      analysedVotes: Math.max(0, totalVotes - pendingVotes),
      promiseChecks,
    },
    latestVotes: (latest.proposals ?? []) as VotingData[],
    period,
    contradicted,
  };
}
