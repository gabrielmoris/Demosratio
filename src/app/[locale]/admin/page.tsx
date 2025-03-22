import AdminProtectedRoute from "@/src/components/adminProtectedRoute/ProtectedRoute";
// import { useTranslations } from "next-intl";

export default function Home() {
  //   const t = useTranslations("admin");

  return (
    <main className="flex flex-col gap-8 md:gap-12 items-center sm:items-start">
      <AdminProtectedRoute>ADMIN</AdminProtectedRoute>
    </main>
  );
}
