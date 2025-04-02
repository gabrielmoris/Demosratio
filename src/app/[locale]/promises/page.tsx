import { PartiesProvider } from "@/src/components/admin/ManageParties/StateManager";
import { PromisesComponent } from "@/src/components/Promises/PromisesComponent";

export default function Promises() {
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <PartiesProvider structured>
          <PromisesComponent />
        </PartiesProvider>
      </main>
    </div>
  );
}
