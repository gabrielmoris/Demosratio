'use client';
import { useLocale, useTranslations } from 'next-intl';
import type { HomeOverview } from '@/types/home';
import { intlLocale } from '@/lib/helpers/dateFormatters';

interface Props {
  counters: HomeOverview['counters'];
  legislatura?: string;
}

export function HomeCounters({ counters, legislatura }: Props) {
  const t = useTranslations('home');
  const locale = useLocale();
  const format = (n: number) => n.toLocaleString(intlLocale(locale));

  return (
    <>
      <div className="w-full flex flex-col md:flex-row gap-5 md:gap-20 justify-between items-center">
        <div className="bg-white border border-drlight rounded-md p-6 flex flex-col gap-1 w-full">
          <p className="font-drserif text-3xl font-bold">{format(counters.analysedVotes)}</p>
          <p className="font-drsans text-sm">
            {t('counter-votes', {
              total: format(counters.totalVotes),
              legislatura: legislatura ?? '',
            })}
          </p>
        </div>
        <div className="bg-white border border-drlight rounded-md p-6 flex flex-col gap-1 w-full">
          <p className="font-drserif text-3xl font-bold">{format(counters.promiseChecks)}</p>
          <p className="font-drsans text-sm">{t('counter-checks')}</p>
        </div>
      </div>
    </>
  );
}
