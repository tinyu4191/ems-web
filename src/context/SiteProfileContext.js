import React, { createContext, useContext, useState, useCallback } from 'react';

const SiteProfileContext = createContext(null);
const STORAGE_KEY = 'ems_site_profile';
const DEFAULT_PROFILE = { companyName: 'Tectiiko EMS', logoDataUrl: null };

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function SiteProfileProvider({ children }) {
  const [profile, setProfile] = useState(loadProfile);

  const updateProfile = useCallback((updates) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SiteProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </SiteProfileContext.Provider>
  );
}

export function useSiteProfile() {
  return useContext(SiteProfileContext);
}