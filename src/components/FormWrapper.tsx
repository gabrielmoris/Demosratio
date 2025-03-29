import { memo } from "react";

type FormWrapperProps = {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
};

export const FormWrapper = memo(({ children, onSubmit }: FormWrapperProps) => (
  <form className="flex flex-1 flex-col bg-white border border-drlight gap-8 rounded-md p-10" onSubmit={onSubmit}>
    {children}
  </form>
));

FormWrapper.displayName = "FormWrapper";
