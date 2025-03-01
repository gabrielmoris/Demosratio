"use client";
import Button from "@/src/components/Button";
import Input from "@/src/components/Input";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

// import Link from "next/link";

export default function Login() {
  const t = useTranslations("login");
  const [form, setForm] = useState<{ name: string; password: string }>({
    name: "",
    password: "",
  });
  const [error, setError] = useState<string>();

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

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-roboto)]">
      <form
        onSubmit={onFormSubmit}
        className="flex flex-col bg-white border border-drlight gap-8 rounded-md p-10 row-start-2 items-center justify-center sm:items-start min-w-96"
      >
        <label className="font-[family-name:var(--font-roboto-serif)] font-bold">
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
        <div className="flex flex-row w-full justify-between items-betwen">
          <Button label={t("btn-register")} type="submit" isSecondary />
          <Button label={t("btn-login")} type="submit" />
        </div>
      </form>
    </div>
  );
}
