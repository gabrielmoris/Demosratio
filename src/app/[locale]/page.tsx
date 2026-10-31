'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import LpCard from '@/src/components/LpCard';
import Loading from '@/src/components/Loading';

import { LegislaturaScoped } from '@/src/components/LegislaturaScoped';
import { useLegislatura } from '@/src/context/legislaturaContext';
import { HomeCounters } from '@/src/components/Home/HomeCounters';
import { ContradictedPromises } from '@/src/components/Home/ContradictedPromises';
import { legislaturaLabel, withLegislatura } from '@/lib/helpers/legislatura';
import type { HomeOverview } from '@/types/home';

export default function Home() {
  const t = useTranslations('home');
  const { selectedId, selected } = useLegislatura();
  const [overview, setOverview] = useState<HomeOverview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(withLegislatura('/api/home', selectedId))
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: HomeOverview) => !cancelled && setOverview(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (failed) return <p className="text-sm text-drgray">{t('error')}</p>;
  if (!overview) {
    return (
      <div className="w-full flex justify-center py-10">
        <Loading />
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8 md:gap-12 items-center sm:items-start mb-20">
      <div className="flex flex-col gap-5 md:gap-10">
        <h1 className="text-2xl font-semibold text-[#262835] font-drsans">{t('title')}</h1>
        <p className="text-lg text-justify">{t('subtitle')}</p>
      </div>

      <LegislaturaScoped>
        <div className="w-full flex flex-col gap-10">
          <HomeCounters
            counters={overview.counters}
            legislatura={selected ? legislaturaLabel(selected.id) : undefined}
          />
          <div className="w-full flex flex-col md:flex-row gap-5 md:gap-20 justify-between items-center">
            <LpCard type="parliament" />
            <LpCard type="promises" />
          </div>
          <ContradictedPromises period={overview.period} promises={overview.contradicted} />
        </div>
      </LegislaturaScoped>
    </section>
  );
}
