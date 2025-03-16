const options = [
  {
    name: "vivienda",
  },
  {
    name: "migración",
  },
  {
    name: "laboral",
  },
  {
    name: "energía",
  },
  {
    name: "industria",
  },
  {
    name: "educación",
  },
  {
    name: "economía",
  },
];

interface Props {
  onClickFunction: (option: string) => void;
}

export default function SugestedSearch({ onClickFunction }: Props) {
  return (
    <div className="flex flex-row gap-5 w-full">
      {options.map((option) => {
        return (
          <span
            className="text-drlight bg-drPurple rounded-full cursor-pointer px-2"
            onClick={() => onClickFunction(option.name)}
            key={option.name}
          >
            {option.name}
          </span>
        );
      })}
    </div>
  );
}
