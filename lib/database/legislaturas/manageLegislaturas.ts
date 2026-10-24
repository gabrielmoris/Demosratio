import { Logger } from 'tslog';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { LegislaturaInput } from '@/types/legislatura';

const log = new Logger();

export async function saveLegislatura({ id, election_date, start_date, end_date }: LegislaturaInput) {
  const { data, error } = await supabaseAdmin
    .from('legislaturas')
    .insert([{ id, election_date, start_date, end_date }])
    .select('id')
    .single();

  if (error) {
    log.error('Error inserting legislatura:', error);
    throw error;
  }

  return data;
}

export async function updateLegislatura({ id, election_date, start_date, end_date }: LegislaturaInput) {
  const { data, error } = await supabaseAdmin
    .from('legislaturas')
    .update({ election_date, start_date, end_date })
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    log.error('Error updating legislatura:', error);
    throw error;
  }

  return data;
}

/** Fails with a foreign key error (23503) while campaigns or votes still belong to it. */
export async function deleteLegislatura(id: number) {
  const { data, error } = await supabaseAdmin
    .from('legislaturas')
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    log.error('Error deleting legislatura:', error);
    throw error;
  }

  return data;
}

/** Makes `id` the current legislatura (and the previous one not current) in one transaction. */
export async function setCurrentLegislatura(id: number) {
  const { error } = await supabaseAdmin.rpc('set_current_legislatura', { p_id: id });

  if (error) {
    log.error('Error setting the current legislatura:', error);
    throw error;
  }
}

/** Creates the legislatura (not current) if it doesn't exist yet, e.g. when the cron finds XVI votes. */
export async function ensureLegislaturaExists(id: number) {
  const { error } = await supabaseAdmin
    .from('legislaturas')
    .upsert([{ id }], { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    log.error(`Error creating legislatura ${id}:`, error);
    throw error;
  }
}
