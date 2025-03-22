import { useTranslations } from "next-intl";
import React from "react";
import Button from "./Button";

interface Props {
  text: string;
  show: () => void;
  click: () => void;
  extendStyle?: string;
}

export const Popup = ({ text, show, click, extendStyle }: Props) => {
  const t = useTranslations("popup");

  const handleHide = () => {
    click();
    show();
  };

  return (
    <main className="h-full z-50 w-full bg-background bg-opacity-5 backdrop-blur-lg absolute top-0 left-0">
      <div
        className={`bg-white left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-md border border-orange gap-5 w-[90%] md:w-1/2 p-5 absolute text-orange flex flex-col gap-5${extendStyle}`}
      >
        {text}
        <div className="flex flex-row gap-2 md:gap-5 w-full items-end justify-end">
          <Button isSecondary label={t("no")} type="button" icn="/back-icn.svg" onClick={() => show()} />
          <Button label={t("yes")} type="button" icn="/del-usr-icn.svg" onClick={handleHide} />
        </div>
      </div>
    </main>
  );
};
