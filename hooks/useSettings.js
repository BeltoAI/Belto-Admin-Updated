import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Check for cached settings first
        const cachedSettings = localStorage.getItem('appSettings');
        if (cachedSettings) {
          setSettings(JSON.parse(cachedSettings));
          setLoading(false);
        }
        
        // Fetch from API regardless to ensure we have the latest
        setLoading(true);
        const response = await fetch('/api/settings');
        
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }
        
        const data = await response.json();
        setSettings(data);
        // Cache the settings
        localStorage.setItem('appSettings', JSON.stringify(data));
        setError(null);
      } catch (err) {
        console.error('Error loading settings:', err);
        setError(err.message);
        if (!localStorage.getItem('appSettings')) {
          toast.error('Failed to load settings');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Function to update settings
  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      const data = await response.json();
      setSettings(data);
      localStorage.setItem('appSettings', JSON.stringify(data));
      toast.success('Settings updated successfully');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update settings');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, updateSettings };
};