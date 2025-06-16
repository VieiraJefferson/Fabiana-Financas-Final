// ToastProvider padrão do shadcn/ui
import * as React from "react";
import { Toaster, toast as sonnerToast } from "sonner";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}

export function useToast() {
  return sonnerToast;
}

export const toast = sonnerToast; 