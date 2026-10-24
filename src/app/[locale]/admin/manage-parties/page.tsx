import ManagePartiesContent from "@/src/components/Parties/ManagePartiesContent";
import { PartiesProvider } from "@/src/components/Parties/PartyStateManager";
import AdminProtectedRoute from "@/src/components/admin/ProtectedRoute";
import { LegislaturaScoped } from "@/src/components/LegislaturaScoped";

export default function ManageParties() {
  return (
    <AdminProtectedRoute>
      <LegislaturaScoped>
        <PartiesProvider>
          <ManagePartiesContent />
        </PartiesProvider>
      </LegislaturaScoped>
    </AdminProtectedRoute>
  );
}
