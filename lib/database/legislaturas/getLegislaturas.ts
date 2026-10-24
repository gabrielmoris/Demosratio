import { Logger } from 'tslog';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { Legislatura } from '@/types/legislatura';
import { envLegislaturaId, parseLegislatura } from '@/lib/helpers/legislatura';

const log = new Logger();

/** All legislaturas, newest first. */
export async function fetchLegislaturas(): Promise<Legislatura[]> {
  const { data, error } = await supabaseAdmin
    .from('legislaturas')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    log.error('Error fetching legislaturas:', error);
    throw error;
  }

  return (data ?? []) as Legislatura[];
}

/**
 * The legislatura the website shows by default and the cron scrapes and analyses.
 * Falls back to the TARGET_LEGISLATURA env var (then XV) if the table has no current row.
 */
export async function fetchCurrentLegislaturaId(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('legislaturas')
    .select('id')
    .eq('is_current', true)
    .maybeSingle();

  if (error) log.error('Error fetching the current legislatura, using the env fallback:', error);

  return data?.id ? Number(data.id) : envLegislaturaId();
}

/** `?legislatura=16` (or `XVI`) from the request url, otherwise the current legislatura. */
export async function resolveLegislaturaId(request: Request): Promise<number> {
  const param = new URL(request.url).searchParams.get('legislatura');
  return parseLegislatura(param) ?? (await fetchCurrentLegislaturaId());
}
