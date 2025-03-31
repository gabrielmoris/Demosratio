import ManagePartiesContent from "@/src/components/admin/ManageParties/ManagePartiesContent";
import { PartiesProvider } from "@/src/components/admin/ManageParties/StateManager";
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
