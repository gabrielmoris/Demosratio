"use client";

import { useAuth } from "@/src/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUiContext } from "@/src/context/uiContext";
import { useTranslations } from "next-intl";
import Loading from "../Loading";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useUiContext();
  const t = useTranslations("protected-route");

  useEffect(() => {
    if (!loading && !currentUser?.is_admin) {
      showToast({
        message: t("not-authorized"),
        variant: "warning",
        duration: 5000,
      });
      setTimeout(() => router.push("/"), 5000);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <section className="w-full h-96 flex justify-center items-center">
        <Loading />
      </section>
    );
  }

  if (!currentUser?.is_admin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
