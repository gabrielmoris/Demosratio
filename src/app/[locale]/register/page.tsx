"use client";
import Button from "@/src/components/Button";
import Input from "@/src/components/Input";
import { useLocale, useTranslations } from "next-intl";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequest } from "@/hooks/use-request";
import { useAuth } from "@/src/context/authContext";
import { useFingerprint } from "@/hooks/fingerprint-gen";

export default function Register() {
  const t = useTranslations("register");
  const [form, setForm] = useState<{
    name: string;
    password: string;
    repeatPassword: string;
  }>({
    name: "",
    password: "",
    repeatPassword: "",
  });

  const router = useRouter();
  const locale = useLocale();
  const { updateCurrentUser } = useAuth();
  const { fingerprint } = useFingerprint();

  const { doRequest } = useRequest({
    url: "/api/users/signup",
    method: "post",
    body: { name: form.name, password: form.password, fingerprint },
    onSuccess: () => {
      updateCurrentUser();
      router.push(`/${locale}`);
    },
  });

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, inputKey: string) => {
    e.preventDefault();

    setForm({ ...form, [inputKey]: e.target.value });
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doRequest();
  };

  const handleToLogin = () => {
    router.push(`/${locale}/login`);
  };

  return (
    <form
      onSubmit={onFormSubmit}
      className="flex flex-col bg-white border border-drlight gap-8 rounded-md p-10 row-start-2 items-center justify-centerw-full md:w-2/3 xl:w-2/3 3xl:w-1/2"
    >
      <label className="font-[family-name:var(--font-roboto-serif)] font-bold w-full text-center text-lg">{t("form-title")}</label>
      <Input
        inputLabel="Nombte / Nick"
        type="text"
        inputObj={form}
        inputKey="name"
        placeholder={form.name}
        setInput={(e) => onInputChange(e, "name")}
        required
      />
      <Input
        inputLabel="Contraseña"
        type="password"
        inputObj={form}
        inputKey="password"
        placeholder={form.password}
        setInput={(e) => onInputChange(e, "password")}
        required
        password
      />
      <Input
        inputLabel="Repite la contraseña"
        inputObj={form}
        inputKey="repeatPassword"
        type="password"
        placeholder={form.repeatPassword}
        setInput={(e) => onInputChange(e, "repeatPassword")}
        required
        password
      />
      <div className="flex flex-col gap-5 xl:flex-row w-full justify-between items-betwen">
        <Button label={t("btn-login")} type="button" isSecondary onClick={handleToLogin} />
        <Button label={t("btn-register")} type="submit" />
      </div>
    </form>
  );
}
