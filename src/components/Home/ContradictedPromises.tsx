'use client';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/routing';
import { formatDate } from '@/lib/helpers/dateFormatters';
import type { HomeOverview } from '@/types/home';
import { StatusBadge } from '@/src/components/Promises/StatusBadge';

interface Props {
  period: HomeOverview['period'];
  promises: HomeOverview['contradicted'];
}

export function ContradictedPromises({ period, promises }: Props) {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-drserif text-xl font-bold">{t('contradicted-title')}</h2>
        {period && (
          <p className="text-drgray text-sm">
            {t('contradicted-period', {
              from: formatDate(period.from, locale),
              to: formatDate(period.to, locale),
            })}
          </p>
        )}
      </div>

      {promises.length === 0 ? (
        <p className="bg-white border border-drlight rounded-md p-6 text-sm">
          {t('contradicted-empty')}
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {promises.map(promise => (
            <li
              key={promise.promise_id}
              className="bg-white border border-drlight rounded-md p-5 flex flex-col gap-3"
            >
              <div className="flex flex-row flex-wrap items-center justify-between gap-2">
                <span className="font-drsans font-bold text-sm">{promise.party_name}</span>
                <StatusBadge
                  status="Contradictory Evidence"
                  statusText={t('contradicted-count', { count: promise.count })}
                />
              </div>
              <p className="font-drsans text-sm">{promise.promise_text}</p>
              <ul className="flex flex-col gap-1">
                {promise.votes.map(vote => (
                  <li key={vote.id}>
                    <Link
                      href={`/parliament/${vote.id}`}
                      className="text-xs underline hover:opacity-70"
                    >
                      {vote.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/temas/${promise.subject_id}`}
                className="text-xs text-drgray underline hover:opacity-70 self-end"
              >
                {t('see-theme')}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
