import Image from "next/image";

interface ImputProps {
  label: string;
  isLoading?: boolean;
  onClick?: () => void;
  icn?: string;
  type?: "submit" | "button" | "reset";
}

export default function Button({
  label,
  isLoading,
  onClick,
  icn,
  type,
}: ImputProps) {
  return (
    <button
      type={type || "button"}
      onClick={onclick ? onClick : () => {}}
      disabled={isLoading}
    >
      {icn && <Image src={icn} alt="btn-icn" width={50} height={50} />}
      {label}
    </button>
  );
}
