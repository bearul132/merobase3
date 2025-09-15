import { createContext, useState } from "react";

export const SampleContext = createContext();

export function SampleProvider({ children }) {
  const [samples, setSamples] = useState([]);

  return (
    <SampleContext.Provider value={{ samples, setSamples }}>
      {children}
    </SampleContext.Provider>
  );
}
