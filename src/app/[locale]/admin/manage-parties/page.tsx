import ManagePartiesContent from "@/src/components/admin/ManageParties/ManagePartiesContent";
import { PartiesProvider } from "@/src/components/admin/ManageParties/StateManager";

export default function ManageParties() {
  return (
    <PartiesProvider>
      <ManagePartiesContent />
    </PartiesProvider>
  );
}
