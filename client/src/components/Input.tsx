interface ImputProps {
  inputObj: Record<string, string>;
  inputKey: string;
  inputLabel: string;
  placeholder: string;
  setInput: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    inputKey: string
  ) => void;
  error: string;
  required: boolean;
  password?: boolean;
}

export default function Input({
  inputObj,
  inputLabel,
  inputKey,
  placeholder,
  setInput,
  error,
  required,
  password,
}: ImputProps) {
  return (
    <div className="relative w-full">
      <input
        type={password ? "password" : "text"}
        name={inputKey}
        id={inputKey}
        required={required}
        value={inputObj[inputKey] || ""}
        autoComplete={password ? "use-password" : inputKey}
        placeholder={placeholder}
        className={`px-2.5 pb-2.5 pt-4 w-full text-lg text-drgray rounded-sm border border-drgray focus:outline-none focus:ring-0 focus:border-drgray peer  ${
          error ? "border-red-500 text-red-900" : "border-drgray"
        }`}
        onChange={(e) => setInput(e, inputKey)}
      />
      <label className="absolute text-lg rounded-sm text-drgray duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-drgray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
        {inputLabel} {required ? "*" : ""}
      </label>
    </div>
  );
}
