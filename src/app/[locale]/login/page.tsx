"use client";
import Button from "@/src/components/Button";
import Input from "@/src/components/Input";
import { useLocale, useTranslations } from "next-intl";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequest } from "@/hooks/use-request";
import { useAuth } from "@/src/context/authContext";
import { useFingerprint } from "@/hooks/fingerprint-gen";

export default function Login() {
  const t = useTranslations("login");
  const { updateCurrentUser } = useAuth();
  const [form, setForm] = useState<{ name: string; password: string }>({
    name: "",
    password: "",
  });
  const { fingerprint } = useFingerprint();

  const { doRequest } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: { name: form.name, password: form.password, fingerprint },
    onSuccess: () => {
      updateCurrentUser();
      router.push(`/${locale}`);
    },
  });

  const router = useRouter();
  const locale = useLocale();

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    inputKey: string
  ) => {
    e.preventDefault();

    setForm({ ...form, [inputKey]: e.target.value });
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doRequest();
  };

  const handleToRegister = () => {
    router.push(`/${locale}/register`);
  };

  return (
    <form
      onSubmit={onFormSubmit}
      className="flex flex-col bg-white border border-drlight gap-8 rounded-md p-10 row-start-2 items-center justify-center w-full xl:my-20"
    >
      <label className="font-[family-name:var(--font-roboto-serif)] font-bold w-full text-center text-lg">
        {t("form-title")}
      </label>
      <Input
        inputLabel={t("input-label-name")}
        inputObj={form}
        type="text"
        inputKey="name"
        placeholder={form.name}
        setInput={(e) => onInputChange(e, "name")}
        required
      />
      <Input
        inputLabel={t("input-label-password")}
        type="password"
        inputObj={form}
        inputKey="password"
        placeholder={form.password}
        setInput={(e) => onInputChange(e, "password")}
        required
        password
      />
      <div className="flex flex-col gap-5 md:flex-row w-full justify-between items-betwen">
        <Button
          label={t("btn-register")}
          type="button"
          isSecondary
          onClick={handleToRegister}
        />
        <Button label={t("btn-login")} type="submit" />
      </div>
    </form>
  );
}
