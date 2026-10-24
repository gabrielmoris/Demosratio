/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { Method } from 'axios';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useUiContext } from '@/src/context/uiContext';

/** Error codes the admin API returns with a translated message under manage-parties.errors */
const KNOWN_ERROR_CODES = [
  'DUPLICATE_LEGISLATURA',
  'LEGISLATURA_IN_USE',
  'LEGISLATURA_IS_CURRENT',
  'DUPLICATE_PARTY',
  'PARTY_ALREADY_IN_LEGISLATURA',
  'PARTY_IN_USE',
  'CAMPAIGN_IN_USE',
];

/**
 * Sends an admin request and shows a toast: the success message, or the translated error.
 * Resolves with the response data, or null when the request failed.
 */
export function useAdminSend() {
  const t = useTranslations('manage-parties');
  const { showToast } = useUiContext();

  return useCallback(
    async (method: Method, url: string, data: object, successMessage?: string): Promise<any> => {
      try {
        const response = await axios.request({ url, method, data, withCredentials: true });
        if (successMessage) showToast({ message: successMessage, variant: 'success', duration: 3000 });
        return response.data ?? {};
      } catch (err: any) {
        const code = err?.response?.data?.code;
        showToast({
          message: KNOWN_ERROR_CODES.includes(code)
            ? t(`errors.${code}`)
            : err?.response?.data?.error || err?.message || 'Error.',
          variant: 'error',
          duration: 5000,
        });
        return null;
      }
    },
    [t, showToast]
  );
}
