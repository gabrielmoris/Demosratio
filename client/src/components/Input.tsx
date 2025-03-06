interface ImputProps {
  inputObj: Record<string, string>;
  inputKey: string;
  inputLabel: string;
  placeholder: string;
  setInput: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, inputKey: string) => void;
  required: boolean;
  password?: boolean;
  type?: "password" | "email" | "text" | "checkbox";
}

export default function Input({ inputObj, inputLabel, inputKey, placeholder, setInput, required, password, type }: ImputProps) {
  return (
    <div className="relative w-full">
      <input
        type={type ? type : "text"}
        name={inputKey}
        id={inputKey}
        required={required}
        value={inputObj[inputKey] || ""}
        autoComplete={password ? "use-password" : inputKey}
        placeholder={placeholder}
        className={`px-2.5 pb-2.5 pt-4 w-full text-lg text-drgray rounded-md border border-drgray focus:outline-none focus:ring-0 focus:border-drgray peer`}
        onChange={(e) => setInput(e, inputKey)}
      />
      <label className="absolute text-lg rounded-md text-drgray duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-drgray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
        {inputLabel} {required ? "*" : ""}
      </label>
    </div>
  );
}
