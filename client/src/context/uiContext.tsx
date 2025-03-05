"use client";
import { Toast, ToastProps } from "@/src/components/Toast";
import React, { createContext, useState, useContext } from "react";

interface ToastParams extends ToastProps {
  duration: number;
}

interface UiContextType {
  showToast: (params: ToastParams) => void;
}

const UiContext = createContext<UiContextType>({
  showToast: () => null,
});

export const UiProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastParams | null>(null);

  const showToast = (params: ToastParams) => {
    setToast(params);
    setTimeout(() => {
      setToast(null);
    }, params.duration);
  };

  return (
    <UiContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </UiContext.Provider>
  );
};

export const useUiContext: () => UiContextType = () => useContext(UiContext);
