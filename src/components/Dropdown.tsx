import { Party } from "@/types/parties";
import Image from "next/image";
import { useState, useCallback } from "react";
import { Campaign } from "@/types/politicalParties";

interface ImputProps {
  items: Party[] | Campaign[];
  deleteItem: (id: number) => void;
  choose: (item: Party | Campaign) => void;
  choice: Party | Campaign;
  className?: string;
}

export default function Dropdown({ className, items, deleteItem, choice, choose }: ImputProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleItemClick = useCallback(
    (item: Party | Campaign) => {
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

  return (
    <div className={`w-full ${className}`}>
      <button
        id="dropdownDefaultButton"
        onClick={() => setIsOpen(!isOpen)}
        data-dropdown-toggle="dropdown"
        className="text-drlight w-full bg-contrast hover:opacity-90 focus:ring-1 focus:outline-none focus:ring-drgray font-medium rounded-md text-sm px-5 py-2.5 text-center inline-flex items-center"
        type="button"
      >
        {"name" in choice ? choice.name : choice.year}
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
          {Array.isArray(items) &&
            items.map((item) => {
              if ("name" in item && "logo_url" in item) {
                return (
                  <li
                    onClick={() => handleItemClick(item)}
                    className="flex cursor-pointer flex-row items-between w-full px-4 py-2  hover:bg-drPurple hover:bg-opacity-50 justify-between items-center"
                    key={item.id}
                  >
                    {item.name}
                    <Image onClick={(event) => handleDeleteClick(item.id, event)} width={20} height={20} alt="delete-icn" src="/delete-icn.svg" />
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
                    <Image onClick={(event) => handleDeleteClick(item.id, event)} width={20} height={20} alt="delete-icn" src="/delete-icn.svg" />
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
