/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUiContext } from "@/src/context/uiContext";
import axios, { AxiosResponse, Method, AxiosRequestConfig } from "axios";
import { useState, ReactNode } from "react";
import { Logger } from "tslog";

const log = new Logger();

interface RequestProps {
  url: string;
  method: Method;
  body?: any;
  onSuccess?: (data: any) => void;
}

export const useRequest = ({ url, method, body, onSuccess }: RequestProps) => {
  const [errors, setErrors] = useState<ReactNode | null>(null);

  const { showToast } = useUiContext();

  const doRequest = async (props = {}): Promise<any> => {
    try {
      setErrors(null);
      const requestConfig: AxiosRequestConfig = {
        url,
        method,
        data: { ...body, ...props },
        withCredentials: true,
      };

      const response: AxiosResponse = await axios.request(requestConfig);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err: any) {
      log.error(err);
      showToast({
        message: err?.response?.data?.error || err?.message || "Error.",
        variant: "error",
        duration: 3000,
      });
      setErrors(err.message);
    }
  };

  return { doRequest, errors };
};
