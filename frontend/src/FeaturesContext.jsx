import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

const FeaturesContext = createContext({ bookingEnabled: false, maintenanceMode: false });

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState({ bookingEnabled: false, maintenanceMode: false });

  useEffect(() => {
    axios
      .get('/api/config/features')
      .then((res) => setFeatures(res.data))
      .catch(() => {});
  }, []);

  return <FeaturesContext.Provider value={features}>{children}</FeaturesContext.Provider>;
}

export function useFeatures() {
  return useContext(FeaturesContext);
}
