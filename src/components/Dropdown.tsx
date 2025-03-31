import Image from "next/image";
import { useState, useCallback } from "react";
import { Campaign, Party, Subject } from "@/types/politicalParties";
import { Popup } from "./Overlay";
import { useTranslations } from "next-intl";

interface ImputProps {
  items: Party[] | Campaign[] | Subject[];
  deleteItem?: (id: number) => void;
  choose: (item: Party | Campaign | Subject) => void;
  choice: Party | Campaign | Subject;
  className?: string;
}

export default function Dropdown({
  className,
  items,
  deleteItem,
  choice,
  choose,
}: ImputProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
  const [idToDelete, setIdToDelete] = useState<number>();

  const t = useTranslations("dropdown");

  const handleItemClick = useCallback(
    (item: Party | Campaign | Subject) => {
      choose(item);
      setIsOpen(false);
    },
    [choose]
  );

  return (
    <div className={`w-full relative ${className}`}>
      {isOpenPopup && (
        <Popup
          click={() => {
            if (!deleteItem || !idToDelete) return;
            deleteItem(idToDelete);
          }}
          text={t("delete-advice")}
          show={() => setIsOpenPopup(false)}
          extendStyle="min-w-52"
        />
      )}
      <button
        id="dropdownDefaultButton"
        onClick={() => setIsOpen(!isOpen)}
        data-dropdown-toggle="dropdown"
        className="w-full bg-white rounded-md border border-drPurple  text-contrast hover:opacity-90 focus:ring-1 focus:outline-none focus:ring-drgray font-medium text-sm px-5 py-2.5 text-center inline-flex items-center"
        type="button"
      >
        {choice && "name" in choice ? choice?.name : choice?.year}
        <svg
          className={`w-2.5 h-2.5 ms-3 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>
      <div
        id="dropdown"
        className={`z-50 ${
          isOpen ? "" : "hidden"
        } bg-white divide-y divide-gray-100 rounded-lg border border-drlight shadow-sm w-full absolute top-10`}
      >
        <ul
          className="py-2 text-sm text-contrast"
          aria-labelledby="dropdownDefaultButton"
        >
          {Array.isArray(items) &&
            items.map((item) => {
              if ("name" in item) {
                return (
                  <li
                    onClick={() => handleItemClick(item)}
                    className="flex cursor-pointer flex-row items-between w-full px-4 py-2  hover:bg-drPurple hover:bg-opacity-50 justify-between items-center"
                    key={item.id}
                  >
                    {item?.name}
                    {deleteItem && (
                      <Image
                        onClick={() => {
                          setIsOpenPopup(true);
                          setIdToDelete(item.id);
                        }}
                        width={20}
                        height={20}
                        alt="delete-icn"
                        src="/delete-icn.svg"
                      />
                    )}
                  </li>
                );
              } else if ("campaign_pdf_url" in item && "year" in item) {
                return (
                  <li
                    onClick={() => handleItemClick(item)}
                    className="flex cursor-pointer flex-row items-between w-full px-4 py-2  hover:bg-drPurple hover:bg-opacity-50 justify-between items-center"
                    key={item.id}
                  >
                    {item.year}
                    <Image
                      onClick={() => {
                        setIsOpenPopup(true);
                        setIdToDelete(item.id);
                      }}
                      width={20}
                      height={20}
                      alt="delete-icn"
                      src="/delete-icn.svg"
                    />
                  </li>
                );
              }

              return null;
            })}
        </ul>
      </div>
    </div>
  );
}
