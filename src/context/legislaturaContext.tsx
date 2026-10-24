'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Legislatura } from '@/types/legislatura';

const STORAGE_KEY = 'legislatura';

interface LegislaturaContextType {
  /** Newest first */
  legislaturas: Legislatura[];
  current?: Legislatura;
  selected?: Legislatura;
  /** Id to send as ?legislatura=. Undefined lets the API use the current one. */
  selectedId?: number;
  /** False until the list of legislaturas has loaded (or failed to) */
  ready: boolean;
  select: (id: number) => void;
  reload: () => Promise<void>;
}

const LegislaturaContext = createContext<LegislaturaContextType>({
  legislaturas: [],
  ready: false,
  select: () => null,
  reload: async () => undefined,
});

const readStored = (): number | null => {
  try {
    const value = Number(window.sessionStorage.getItem(STORAGE_KEY));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
};

const writeStored = (id: number) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(id));
  } catch {
    // Storage blocked (private mode, previews): the choice just isn't remembered
  }
};

export const LegislaturaProvider = ({ children }: { children: React.ReactNode }) => {
  const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
  const [selectedId, setSelectedId] = useState<number>();
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/legislaturas');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const list: Legislatura[] = await res.json();
      setLegislaturas(list);
      setSelectedId(prev => {
        const wanted = prev ?? readStored();
        if (wanted && list.some(l => l.id === wanted)) return wanted;
        return (list.find(l => l.is_current) ?? list[0])?.id;
      });
    } catch (error) {
      console.error('Error loading legislaturas:', error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const select = useCallback((id: number) => {
    setSelectedId(id);
    writeStored(id);
  }, []);

  const value = useMemo(
    () => ({
      legislaturas,
      current: legislaturas.find(l => l.is_current),
      selected: legislaturas.find(l => l.id === selectedId),
      selectedId,
      ready,
      select,
      reload,
    }),
    [legislaturas, selectedId, ready, select, reload]
  );

  return <LegislaturaContext.Provider value={value}>{children}</LegislaturaContext.Provider>;
};

export const useLegislatura = () => useContext(LegislaturaContext);
