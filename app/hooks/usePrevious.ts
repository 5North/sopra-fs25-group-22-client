import { useRef, useEffect } from "react";

export function usePrevious<T>(value: T): T | undefined {
  // initialize with undefined so ref.current starts off undefined
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
