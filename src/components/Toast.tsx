import React from "react";

export interface ToastProps {
  message: string;
  variant: "success" | "error" | "warning" | "info";
  duration: number;
}

/**
 * Toast notification component
 */
export const Toast = ({ message, variant, duration }: ToastProps) => {
  const toastRef = React.useRef<HTMLDivElement>(null);
  const [animateIn, setAnimateIn] = React.useState(false);
  const [animateOut, setAnimateOut] = React.useState(false);

  React.useEffect(() => {
    setAnimateIn(true);

    setTimeout(() => {
      setAnimateIn(false);
      setAnimateOut(true);
    }, duration - 500);

    setTimeout(() => {
      setAnimateOut(false);
    }, duration);
  }, [duration]);

  const variantClasses = {
    success: "bg-drgreen bg-opacity-20 border-drgreen text-drgreen",
    error: "bg-drerror bg-opacity-20 border-drerror text-drerror",
    warning: "bg-drgray bg-opacity-20 border-drgray text-drgray",
    info: "bg-drPurple bg-opacity-20 border-drPurple text-drPurple",
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        fixed top-5 left-1/2 md:left-[calc(50%+2rem)] -translate-x-1/2 
        border-2 backdrop-blur-2xl p-4 rounded-md
        transition-transform duration-300
        ${animateIn ? "scale-110 opacity-100" : "scale-10 opacity-100"}
        ${animateOut ? "scale-0 opacity-0" : "scale-0 opacity-0"}
      `}
      role="alert"
      ref={toastRef}
    >
      <p>{message}</p>
    </div>
  );
};
