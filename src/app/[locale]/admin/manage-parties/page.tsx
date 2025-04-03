import ManagePartiesContent from "@/src/components/Parties/ManagePartiesContent";
import { PartiesProvider } from "@/src/components/Parties/PartyStateManager";
import AdminProtectedRoute from "@/src/components/admin/ProtectedRoute";

export default function ManageParties() {
  return (
    <AdminProtectedRoute>
      <PartiesProvider>
        <ManagePartiesContent />
      </PartiesProvider>
    </AdminProtectedRoute>
  );
}
