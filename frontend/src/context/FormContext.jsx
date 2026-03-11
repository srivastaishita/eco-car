import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const FormContext = createContext(null);

const STORAGE_KEY = "carbonwise_form";

const defaultFormData = {
  make: "All Makes",
  model: "All Models",
  year: "All Years",
  distance: "",
};

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState(() => {
    if (typeof window === "undefined") return defaultFormData;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultFormData;
      const parsed = JSON.parse(raw);
      return { ...defaultFormData, ...parsed };
    } catch {
      return defaultFormData;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore storage errors
    }
  }, [formData]);

  const updateForm = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const value = useMemo(
    () => ({ formData, updateForm }),
    [formData]
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = () => {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return ctx;
};

