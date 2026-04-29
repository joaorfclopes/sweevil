import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const FeaturesContext = createContext({ bookingEnabled: false });

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState({ bookingEnabled: false });

  useEffect(() => {
    axios
      .get("/api/config/features")
      .then((res) => setFeatures(res.data))
      .catch(() => {});
  }, []);

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeaturesContext);
}
