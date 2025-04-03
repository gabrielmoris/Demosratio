import { PartiesProvider } from "@/src/components/Parties/PartyStateManager";
import { PartyChoiceComponent } from "@/src/components/Promises/PartyChoiceComponent";

export default function Promises() {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center mb-24 md:mb-5 min-h-96 gap-16 font-drsans">
      <main className="flex w-full flex-col gap-8 items-center justify-center">
        <PartiesProvider structured>
          <PartyChoiceComponent />
        </PartiesProvider>
      </main>
    </div>
  );
}
