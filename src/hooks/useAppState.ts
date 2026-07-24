import { useState, useEffect } from 'react';
import { Visit, AppSettings } from '../types';
import { getInitialVisits, DEFAULT_SETTINGS } from '../data/seedData';

export function useAppState() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'map' | 'settings'>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize and load from LocalStorage (Simulated SQLite Offline First)
  useEffect(() => {
    try {
      const storedVisits = localStorage.getItem('bvp_visits');
      const storedSettings = localStorage.getItem('bvp_settings');

      if (storedVisits) {
        setVisits(JSON.parse(storedVisits));
      } else {
        const initialVisits = getInitialVisits();
        setVisits(initialVisits);
        localStorage.setItem('bvp_visits', JSON.stringify(initialVisits));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('bvp_settings', JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (e) {
      console.error("Failed to load offline SQLite state from LocalStorage:", e);
      // Fallback
      setVisits(getInitialVisits());
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const saveVisits = (newVisits: Visit[]) => {
    setVisits(newVisits);
    localStorage.setItem('bvp_visits', JSON.stringify(newVisits));
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('bvp_settings', JSON.stringify(newSettings));
  };

  // Visits Repository Operations
  const addVisit = (visit: Omit<Visit, 'id'>) => {
    const id = `visit-${Date.now()}`;
    const newVisit: Visit = { ...visit, id };
    const updated = [...visits, newVisit];
    saveVisits(updated);
    return newVisit;
  };

  const updateVisit = (updatedVisit: Visit) => {
    const updated = visits.map(v => v.id === updatedVisit.id ? updatedVisit : v);
    saveVisits(updated);
  };

  const deleteVisit = (id: string) => {
    const updated = visits.filter(v => v.id !== id);
    saveVisits(updated);
  };

  // Theme support
  useEffect(() => {
    const root = window.document.documentElement;
    const theme = settings.theme;
    
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  return {
    isInitialized,
    visits,
    settings,
    activeTab,
    setActiveTab,
    addVisit,
    updateVisit,
    deleteVisit,
    updateSettings: saveSettings
  };
}
