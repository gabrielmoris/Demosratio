"use client";
import { PartiesProvider } from "@/src/components/Parties/PartyStateManager";
import { PromisesView } from "@/src/components/Promises/PromisesView";

export default function Promises() {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center mb-24 md:mb-5 min-h-96 font-drsans">
      <main className="flex w-full flex-col items-center justify-center">
        <PartiesProvider structured>
          <div className="w-full bg-white shadow-sm rounded-lg p-4 md:p-6">
            <PromisesView />
          </div>
        </PartiesProvider>
      </main>
    </div>
  );
}
