import { describe, it, expect, vi, beforeEach } from 'vitest';

type Call = [string, unknown[]];
type Query = { table: string; calls: Call[] };
type Result = { data?: unknown; count?: number | null; error: unknown };

const { state, mockFrom } = vi.hoisted(() => {
  const state: { handler: (q: Query) => Result } = { handler: () => ({ data: [], count: 0, error: null }) };

  // Chainable stand-in for the Supabase query builder: records every call and
  // resolves (when awaited or on maybeSingle) to whatever the test's handler returns.
  const makeBuilder = (table: string) => {
    const q: Query = { table, calls: [] };
    const builder: unknown = new Proxy(
      {},
      {
        get(_, prop: string) {
          if (prop === 'then') {
            return (resolve: (v: Result) => unknown, reject: (e: unknown) => unknown) =>
              Promise.resolve(state.handler(q)).then(resolve, reject);
          }
          return (...args: unknown[]) => {
            q.calls.push([prop, args]);
            return prop === 'maybeSingle' ? Promise.resolve(state.handler(q)) : builder;
          };
        },
      }
    );
    return builder;
  };

  return { state, mockFrom: vi.fn((table: string) => makeBuilder(table)) };
});

vi.mock('@/lib/supabaseClient', () => ({ supabaseAdmin: { from: mockFrom } }));
vi.mock('@/lib/database/spanishParliament/getAllProposals', () => ({
  getAllProposals: vi.fn(async () => ({ proposals: [{ id: 9, title: 'Latest' }], count: 1 })),
}));

import { getHomeOverview } from '@/lib/database/home/getHomeOverview';
import { getAllProposals } from '@/lib/database/spanishParliament/getAllProposals';

const has = (q: Query, method: string, ...args: unknown[]) =>
  q.calls.some(([m, a]) => m === method && args.every((arg, i) => a[i] === arg));
const isCount = (q: Query) => q.calls.some(([m, a]) => m === 'select' && (a[1] as { head?: boolean })?.head);

const contradiction = (promise_id: number, proposal_id: number, party_name = 'PSOE') => ({
  promise_id,
  promise_text: `Promise ${promise_id}`,
  party_id: 1,
  party_name,
  subject_id: 3,
  proposal_id,
});

describe('getHomeOverview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('counts votes and checks, and ranks the promises contradicted in the last voting period', async () => {
    state.handler = q => {
      if (q.table === 'proposals' && isCount(q)) {
        return { count: has(q, 'eq', 'promise_analysis_status', 'pending') ? 2 : 10, error: null };
      }
      if (q.table === 'promise_status' && isCount(q)) return { count: 40, error: null };
      if (q.table === 'proposals' && has(q, 'maybeSingle')) return { data: { date: '2026-10-28T00:00:00' }, error: null };
      if (q.table === 'proposals') {
        return {
          data: [
            { id: 1, title: 'Vote 1' },
            { id: 2, title: 'Vote 2' },
          ],
          error: null,
        };
      }
      // Promise 7 is contradicted by two votes (one of them listed twice), promise 5 by one
      return {
        data: [contradiction(5, 1, 'PP'), contradiction(7, 1), contradiction(7, 2), contradiction(7, 2)],
        error: null,
      };
    };

    const overview = await getHomeOverview(15);

    expect(overview.counters).toEqual({ totalVotes: 10, analysedVotes: 8, promiseChecks: 40 });
    expect(overview.latestVotes).toEqual([{ id: 9, title: 'Latest' }]);
    expect(getAllProposals).toHaveBeenCalledWith(1, 3, 15);
    expect(overview.period).toEqual({ from: '2026-09-29', to: '2026-10-28' });
    expect(overview.contradicted.map(p => [p.promise_id, p.count])).toEqual([
      [7, 2],
      [5, 1],
    ]);
    expect(overview.contradicted[0].votes).toEqual([
      { id: 1, title: 'Vote 1' },
      { id: 2, title: 'Vote 2' },
    ]);
  });

  it('filters the period to the whole last voting day', async () => {
    const periodQueries: Query[] = [];
    state.handler = q => {
      if (isCount(q)) return { count: 0, error: null };
      if (has(q, 'maybeSingle')) return { data: { date: '2026-10-28T00:00:00' }, error: null };
      if (q.table === 'proposals') periodQueries.push(q);
      return { data: [], error: null };
    };

    await getHomeOverview(15);

    expect(has(periodQueries[0], 'gte', 'date', '2026-09-29')).toBe(true);
    expect(has(periodQueries[0], 'lt', 'date', '2026-10-29')).toBe(true);
  });

  it('returns no period and no contradictions when the legislatura has no votes', async () => {
    state.handler = q => {
      if (isCount(q)) return { count: 0, error: null };
      if (has(q, 'maybeSingle')) return { data: null, error: null };
      throw new Error(`Unexpected query on ${q.table}`);
    };

    const overview = await getHomeOverview(16);

    expect(overview.period).toBeNull();
    expect(overview.contradicted).toEqual([]);
  });

  it('throws when a query fails', async () => {
    state.handler = () => ({ data: null, count: null, error: new Error('DB down') });
    await expect(getHomeOverview(15)).rejects.toThrow('DB down');
  });
});
