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
  const [form, setForm] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });
  const { fingerprint } = useFingerprint();

  const { doRequest } = useRequest({
    url: "http://localhost:3002/api/users/signin",
    method: "post",
    body: { email: form.email, password: form.password, fingerprint },
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
    <div className="w-full flex flex-col items-center justify-center min-h-screen p-2 md:p-8 pb-20 gap-16 font-[family-name:var(--font-roboto)]">
      <form
        onSubmit={onFormSubmit}
        className="flex flex-col bg-white border border-drlight gap-8 rounded-md p-10 row-start-2 items-center justify-center w-full md:w-1/2 md:min-w-96"
      >
        <label className="font-[family-name:var(--font-roboto-serif)] font-bold w-full text-center text-lg">
          {t("form-title")}
        </label>

        {/* <Button label={t("btn-google")} type="button" isSecondary icn="/google-icn.svg" />
        <div className="w-full h-10 flex flex-col items-center justify-center relative">
          <p className="bg-white p-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">{t("or-email")}</p>
          <hr className="bg-drgray w-1/2" />
        </div> */}
        <Input
          inputLabel="Email"
          inputObj={form}
          type="email"
          inputKey="email"
          placeholder={form.email}
          setInput={onInputChange}
          required
        />
        <Input
          inputLabel="Contraseña"
          type="password"
          inputObj={form}
          inputKey="password"
          placeholder={form.password}
          setInput={onInputChange}
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
    </div>
  );
}
