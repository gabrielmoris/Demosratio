/* eslint-disable @typescript-eslint/no-explicit-any */
interface ImputProps {
  inputObj?: Record<string, any>;
  inputKey?: string;
  inputString?: string;
  inputLabel: string;
  placeholder: string | number;
  setInput: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    inputKey?: string
  ) => void;
  required?: boolean;
  password?: boolean;
  type?:
    | "password"
    | "email"
    | "text"
    | "checkbox"
    | "number"
    | "textarea"
    | "range";
  className?: string;
  placeholderClass?: string;
}

export default function Input({
  inputObj,
  inputLabel,
  inputKey,
  inputString,
  placeholder,
  setInput,
  required,
  password,
  type,
  placeholderClass,
  className,
}: ImputProps) {
  if (type === "textarea") {
    return (
      <div className={`relative w-full ${className}`}>
        <textarea
          name={inputKey}
          id={inputKey}
          required={required}
          value={inputObj && inputKey ? inputObj[inputKey] : inputString}
          autoComplete={password ? "use-password" : inputKey}
          placeholder={placeholder.toString()}
          className={`${placeholderClass} px-2.5 pb-2.5 pt-4 w-full min-h-28 text-lg text-drgray rounded-md border border-drPurple focus:outline-none focus:ring-0 focus:border-bg-drgray peer`}
          onChange={(e) => setInput(e, inputKey ? inputKey : inputString || "")}
        />
        <label
          htmlFor={inputKey}
          className="absolute text-lg rounded-md text-drgray duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent backdrop-blur-sm px-2 peer-focus:px-2 peer-focus:text-drgray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/4 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
        >
          {inputLabel} {required ? "*" : ""}
        </label>
      </div>
    );
  }
  if (type === "range") {
    return (
      <div className={`relative flex flex-col gap-2 w-full ${className}`}>
        <label
          htmlFor={inputKey}
          className="rounded-md text-drgray duration-300 transform xl:text-xl peer-focus:text-drgray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2  left-1"
        >
          {inputLabel} {inputString + "%"}
        </label>
        <input
          type={type ? type : "text"}
          name={inputKey}
          id={inputKey}
          required={required}
          min="0"
          max="100"
          step="5"
          value={inputObj && inputKey ? inputObj[inputKey] : inputString}
          placeholder={placeholder.toString() + "%"}
          className={`w-full h-4 bg-gradient-to-r from-drerror via-drgray to-drgreen rounded-lg appearance-none cursor-pointer ${placeholderClass}`}
          onChange={(e) => setInput(e, inputKey ? inputKey : inputString || "")}
          style={
            {
              "--thumb-color": "var(--background)",
              "--thumb-size": "18px",
              "--thumb-shadow": "0 2px 5px rgba(0, 0, 0, 0.3)",
            } as React.CSSProperties
          }
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: var(--thumb-size);
            height: var(--thumb-size);
            background: var(--thumb-color);
            border-radius: 50%;
            box-shadow: var(--thumb-shadow);
            cursor: pointer;
          }

          input[type="range"]::-moz-range-thumb {
            width: var(--thumb-size);
            height: var(--thumb-size);
            background: var(--thumb-color);
            border-radius: 50%;
            box-shadow: var(--thumb-shadow);
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type={type ? type : "text"}
        name={inputKey}
        id={inputKey}
        required={required}
        value={inputObj && inputKey ? inputObj[inputKey] : inputString}
        autoComplete={password ? "use-password" : inputKey}
        placeholder={placeholder.toString()}
        className={`${placeholderClass} px-2.5 pb-2.5 pt-4 w-full text-lg text-drgray rounded-md border border-drPurple focus:outline-none focus:ring-0 focus:border-bg-drgray  peer`}
        onChange={(e) => setInput(e, inputKey ? inputKey : inputString || "")}
      />
      <label
        htmlFor={inputKey}
        className="absolute text-lg rounded-md text-drgray duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent backdrop-blur-sm px-2 peer-focus:px-2 peer-focus:text-drgray peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
      >
        {inputLabel} {required ? "*" : ""}
      </label>
    </div>
  );
}
