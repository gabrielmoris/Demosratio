"use client";
import Button from "@/src/components/Button";
import Input from "@/src/components/Input";
import { useLocale, useTranslations } from "next-intl";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [error, setError] = useState<string>();

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
    setError("");
    console.log(form);
  };

  const handleToLogin = () => {
    router.push(`/${locale}/login`);
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
        <Input
          inputLabel="Nombre"
          inputObj={form}
          inputKey="name"
          placeholder={form.name}
          setInput={onInputChange}
          error={error || ""}
          required
        />
        <Input
          inputLabel="Contraseña"
          inputObj={form}
          inputKey="password"
          placeholder={form.password}
          setInput={onInputChange}
          error={error || ""}
          required
          password
        />
        <Input
          inputLabel="Repite la contraseña"
          inputObj={form}
          inputKey="repeat-password"
          placeholder={form.repeatPassword}
          setInput={onInputChange}
          error={error || ""}
          required
          password
        />
        <div className="flex flex-col gap-5 md:flex-row w-full justify-between items-betwen">
          <Button
            label={t("btn-login")}
            type="button"
            isSecondary
            onClick={handleToLogin}
          />
          <Button label={t("btn-register")} type="submit" />
        </div>
      </form>
    </div>
  );
}
