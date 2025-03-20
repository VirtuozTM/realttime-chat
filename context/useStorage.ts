import { useEffect, useCallback, useReducer } from "react";
import * as SecureStore from "expo-secure-store";

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
  return useReducer(
    (
      state: [boolean, T | null],
      action: T | null = null
    ): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export function useStorageState<T>(key: string): UseStateHook<T> {
  // Public
  const [state, setState] = useAsyncState<T>();

  // Get
  useEffect(() => {
    SecureStore.getItemAsync(key).then((value) => {
      if (value != null) {
        try {
          const parsedValue = JSON.parse(value) as T;
          setState(parsedValue);
        } catch (error) {
          // Si la désérialisation échoue, on suppose que c'est une chaîne
          setState(value as unknown as T);
        }
      } else {
        setState(null);
      }
    });
  }, [key]);

  // Set
  const setValue = useCallback(
    (value: T | null) => {
      setState(value);
      const stringValue = value != null ? JSON.stringify(value) : null;
      setStorageItemAsync(key, stringValue);
    },
    [key]
  );

  return [[state[0], state[1]], setValue];
}
