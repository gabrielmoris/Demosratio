import { Party } from "@/types/parties";
import Image from "next/image";
import { useState, useCallback, memo, ChangeEvent } from "react";
import Input from "./Input";
import { useTranslations } from "next-intl";
import Button from "./Button";

interface ImputProps {
  items: Party[];
  deleteItem: (id: number) => void;
  choose: (item: Party) => void;
  choice: Party;
  className?: string;
  handleClick?: (item: Partial<Party>) => void;
}

const MemoizedInput = memo(Input);

export default function Dropdown({ className, items, deleteItem, choice, choose, handleClick }: ImputProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [partyToSave, setPartyToSave] = useState({ name: "", logo_url: "" });
  const t = useTranslations("dropdown");

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, inputKey: string | undefined) => {
      e.preventDefault();
      if (inputKey) {
        setPartyToSave({ ...partyToSave, [inputKey]: e.target.value });
      }
    },
    [partyToSave]
  );

  const handleItemClick = useCallback(
    (item: Party) => {
      choose(item);
      setIsOpen(false);
    },
    [choose]
  );

  const handleDeleteClick = useCallback(
    (id: number, event: React.MouseEvent<HTMLImageElement>) => {
      event.stopPropagation();
      deleteItem(id);
    },
    [deleteItem]
  );

  const handleClickBtn = useCallback(() => {
    if (!handleClick) return;
    handleClick(partyToSave);
    setPartyToSave({ name: "", logo_url: "" });
  }, [handleClick, partyToSave]);

  return (
    <div className={`w-full ${className}`}>
      <button
        id="dropdownDefaultButton"
        onClick={() => setIsOpen(!isOpen)}
        data-dropdown-toggle="dropdown"
        className="text-drlight w-full bg-contrast hover:opacity-90 focus:ring-1 focus:outline-none focus:ring-drgray font-medium rounded-md text-sm px-5 py-2.5 text-center inline-flex items-center"
        type="button"
      >
        {choice.name}
        <svg
          className={`w-2.5 h-2.5 ms-3 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
        </svg>
      </button>
      <div id="dropdown" className={`z-10 ${isOpen ? "" : "hidden"} bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-full`}>
        <ul className="py-2 text-sm text-contrast" aria-labelledby="dropdownDefaultButton">
          {handleClick && (
            <form className="w-full p-2.5 flex flex-col gap-2 scale-90 transform-gpu">
              <MemoizedInput
                inputLabel={t("input-label-name")}
                inputObj={partyToSave}
                type="text"
                inputKey="name"
                placeholder={partyToSave.name}
                setInput={onInputChange}
                placeholderClass="h-12"
                required
              />
              <MemoizedInput
                inputLabel={t("input-label-logo_url")}
                inputObj={partyToSave}
                type="text"
                inputKey="logo_url"
                placeholder={partyToSave.logo_url}
                setInput={onInputChange}
                placeholderClass="h-12"
                required
              />
              <Button label={t("save-party-btn")} onClick={handleClickBtn} />
              <hr className=" w-full mt-2" />
            </form>
          )}
          {items.map((item: Party) => (
            <li
              onClick={() => handleItemClick(item)}
              className="flex cursor-pointer flex-row items-between w-full px-4 py-2  hover:bg-drPurple hover:bg-opacity-50 justify-between items-center"
              key={item.id}
            >
              {item.name}
              <Image onClick={(event) => handleDeleteClick(item.id, event)} width={20} height={20} alt="delete-icn" src="/delete-icn.svg" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
