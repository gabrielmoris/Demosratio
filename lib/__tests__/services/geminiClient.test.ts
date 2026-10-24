import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzePromisesWithGemini, getPromiseAnalysisEndpoint } from '@/lib/services/geminiClient';
import { PartyWithPromises } from '@/types/politicalParties';
import { VotingData } from '@/types/proposal.types';

const endpoint = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const parties = [
  { id: 1, name: 'Partido', year: '2023', campaign_year: 2023, promises: [] },
] as unknown as PartyWithPromises[];

const vote = { title: 'Proposiciones no de Ley.', expedient_text: 'Proposición no de Ley' } as VotingData;

const geminiAnswer = (text: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });

describe('getPromiseAnalysisEndpoint', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('prefers GEMINI_ANALYSIS_MODEL_ENDPOINT', () => {
    vi.stubEnv('GEMINI_MODEL_ENDPOINT', endpoint('gemini-3.5-flash-lite'));
    vi.stubEnv('GEMINI_ANALYSIS_MODEL_ENDPOINT', endpoint('gemini-2.5-flash'));
    expect(getPromiseAnalysisEndpoint()).toBe(endpoint('gemini-2.5-flash'));
  });

  it('falls back to GEMINI_MODEL_ENDPOINT when it is unset or empty', () => {
    vi.stubEnv('GEMINI_MODEL_ENDPOINT', endpoint('gemini-3.5-flash-lite'));
    vi.stubEnv('GEMINI_ANALYSIS_MODEL_ENDPOINT', '');
    expect(getPromiseAnalysisEndpoint()).toBe(endpoint('gemini-3.5-flash-lite'));
  });
});

describe('analyzePromisesWithGemini', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_MODEL_ENDPOINT', endpoint('gemini-3.5-flash-lite'));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('calls the analysis model with thinking off (thinkingBudget 0) on Gemini 2.5 Flash', async () => {
    vi.stubEnv('GEMINI_ANALYSIS_MODEL_ENDPOINT', endpoint('gemini-2.5-flash'));
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(geminiAnswer('[]'));

    await analyzePromisesWithGemini(parties, vote);

    expect(String(fetchSpy.mock.calls[0][0])).toContain('/models/gemini-2.5-flash:generateContent');
    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(body.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 0 });
  });

  it('uses the minimal level when it falls back to a Gemini 3 model', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(geminiAnswer('[]'));

    await analyzePromisesWithGemini(parties, vote);

    expect(String(fetchSpy.mock.calls[0][0])).toContain('/models/gemini-3.5-flash-lite:generateContent');
    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(body.generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'minimal' });
  });
});
