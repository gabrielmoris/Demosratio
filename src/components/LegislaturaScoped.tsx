'use client';
import { Fragment } from 'react';
import { useLegislatura } from '@/src/context/legislaturaContext';
import Loading from './Loading';

export function LegislaturaScoped({ children }: { children: React.ReactNode }) {
  const { ready, selectedId } = useLegislatura();

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loading />
      </div>
    );
  }

  return <Fragment key={selectedId ?? 'current'}>{children}</Fragment>;
}
