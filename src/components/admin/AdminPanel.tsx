'use client';
import { useRequest } from '@/hooks/use-request';
import { useUiContext } from '@/src/context/uiContext';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface Props {
  id?: number;
  name: string;
  icon: string;
  link?: string;
  api?: string;
}

export const AdminPanel = ({ name, icon, link, api }: Props) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('admin');
  const { showToast } = useUiContext();

  const { doRequest } = useRequest({
    url: api ?? '',
    method: 'get',
    onSuccess: data => {
      if (data?.kind === 'promise-analysis') {
        showToast({
          message:
            data.stoppedBecause === 'no_promises'
              ? t('analyses-no-promises')
              : data.remaining > 0
                ? t('analyses-processed', { count: data.processed, remaining: data.remaining })
                : t('analyses-up-to-date'),
          variant: data.stoppedBecause === 'no_promises' ? 'warning' : 'success',
          duration: 6000,
        });
        return;
      }
      if (typeof data?.processed === 'number') {
        showToast({
          message:
            data.processed > 0
              ? t('summaries-processed', { count: data.processed, done: data.counts?.done ?? 0 })
              : t('summaries-up-to-date'),
          variant: 'success',
          duration: 6000,
        });
      }
    },
  });

  const runRequest = async () => {
    if (link) {
      router.push(`/${locale}/${link}`);
      return;
    }

    if (!api || isRunning) return;

    setIsRunning(true);

    await doRequest();
    setIsRunning(false);
  };

  return (
    <div
      className="flex justify-start items-center cursor-pointer flex-row max-h-32 gap-5 md:gap-20 border bg-white border-drPurple border-opacity-30 p-8 md:px-20 rounded-md w-full hover:shadow-drPurple hover:shadow-sm"
      onClick={runRequest}
    >
      <Image
        alt={name}
        src={icon}
        width={30}
        height={30}
        className={`${isRunning ? 'animate-spin' : ''}`}
      />
      <p className="font-bold text-md md:text-xl">{name}</p>
    </div>
  );
};
