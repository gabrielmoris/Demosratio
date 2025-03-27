import { AdminPanel } from "@/src/components/admin/AdminPanel";
import AdminProtectedRoute from "@/src/components/admin/ProtectedRoute";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("admin");

  const ADMIN_PANELS = [
    { id: 1, name: t("syncronize-parmialent"), icon: "/auto-icn.svg", api: "/api/cron/parliament-data" },
    { id: 2, name: t("add-party"), icon: "/add-party-icn.svg", link: "/admin/add-parties" },
    { id: 3, name: t("add-promises"), icon: "/add-promises-icn.svg", link: "/admin/add-promises" },
    { id: 4, name: t("change-user-rights"), icon: "/usr-admin-icn.svg", link: "/admin/user-admin" },
  ];

  return (
    <main className="flex flex-col gap-8 md:gap-12 items-center sm:items-start">
      <AdminProtectedRoute>
        {ADMIN_PANELS &&
          ADMIN_PANELS.map((panel) => <AdminPanel key={panel.id} name={panel.name} icon={panel.icon} link={panel.link} api={panel.api} />)}
      </AdminProtectedRoute>
    </main>
  );
}
