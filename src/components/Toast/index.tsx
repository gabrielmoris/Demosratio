import React from "react";
import styles from "./toast.module.css";

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

  // animate component popping in and out on duration
  React.useEffect(() => {
    if (toastRef.current) {
      toastRef.current.classList.add(styles["animate-toast-in"]);
      setTimeout(() => {
        if (toastRef.current) {
          toastRef.current.classList.remove(styles["animate-toast-in"]);
          toastRef.current.classList.add(styles["animate-toast-out"]);
        }
      }, duration - 500);
    }
  }, [duration]);

  return (
    <div
      className={`${
        variant === "success"
          ? "bg-drgreen bg-opacity-20 border-drgreen text-drgreen"
          : variant === "error"
          ? "bg-drerror bg-opacity-20 border-drerror text-drerror"
          : variant === "warning"
          ? "bg-drgray bg-opacity-20 border-drgray text-drgray"
          : "bg-drPurple bg-opacity-20 border-drPurple text-drPurple"
      } fixed right-5 top-5 transform -translate-x-1/2 border-2 backdrop-blur-2xl p-4 rounded-md `}
      role="alert"
      ref={toastRef}
    >
      <p>{message}</p>
    </div>
  );
};
