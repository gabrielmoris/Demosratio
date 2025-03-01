import Image from "next/image";

interface ImputProps {
  label: string;
  isLoading?: boolean;
  onClick?: () => void;
  isSecondary?: boolean;
  icn?: string;
  type?: "submit" | "button" | "reset";
  className?: string;
}

export default function Button({
  label,
  isSecondary,
  isLoading,
  onClick,
  className,
  icn,
  type,
}: ImputProps) {
  return (
    <button
      type={type || "button"}
      onClick={onclick ? onClick : () => {}}
      disabled={isLoading}
      className={`py-2 px-5 min-w-36 rounded-sm font-[family-name:var(--font-roboto)] hover:opacity-85 ${
        isSecondary ? "bg-drlight text-contrast" : "bg-contrast text-drlight"
      } ${className}`}
    >
      {icn && <Image src={icn} alt="btn-icn" width={50} height={50} />}
      {label}
    </button>
  );
}
