import Image from "next/image";

interface ImputProps {
  label: string;
  isLoading?: boolean;
  isSecondary?: boolean;
  icn?: string;
  type?: "submit" | "button" | "reset";
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Button({ label, isSecondary, isLoading, className, icn, type, onClick }: ImputProps) {
  return (
    <button
      type={type || "button"}
      disabled={isLoading}
      onClick={onClick}
      className={`py-2 px-5 w-full flex flex-row gap-5 items-center justify-center rounded-md font-[family-name:var(--font-roboto)] hover:opacity-80 duration-500 ${
        isSecondary ? "bg-drlight text-contrast" : "bg-contrast text-drlight"
      } ${className}`}
    >
      {icn && <Image src={icn} alt="btn-icn" width={30} height={30} />}
      {label}
    </button>
  );
}
