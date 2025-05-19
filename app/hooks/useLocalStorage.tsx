import { useEffect, useState } from "react";

interface LocalStorage<T> {
  value: T;
  set: (newVal: T) => void;
  clear: () => void;
}

/**
 * Custom hook to sync a value with localStorage, with SSR safety and JSON fallback.
 * @param key - localStorage key
 * @param defaultValue - default state value
 */
export default function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): LocalStorage<T> {
  const [value, setValue] = useState<T>(defaultValue);

  // On mount, read the stored value (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = globalThis.localStorage.getItem(key);
    if (raw === null) return;

    try {
      // attempt to parse JSON
      setValue(JSON.parse(raw) as T);
    } catch {
      // fallback: treat raw as the stored value
      setValue(raw as unknown as T);
    }
  }, [key]);

  // Setter: syncs React state and localStorage
  const set = (newVal: T) => {
    setValue(newVal);
    if (typeof window !== "undefined") {
      globalThis.localStorage.setItem(key, JSON.stringify(newVal));
    }
  };

  // Clear: remove from storage and reset state
  const clear = () => {
    setValue(defaultValue);
    if (typeof window !== "undefined") {
      globalThis.localStorage.removeItem(key);
    }
  };

  return { value, set, clear };
}
