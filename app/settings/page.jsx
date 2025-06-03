"use client";

import React, { useState, useEffect } from 'react';
import { FiInfo, FiDownload, FiSave, FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Tooltip from '../components/ToolTip';
import { jsPDF } from 'jspdf';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    allowCopyPaste: true,
    copyPasteLectureOverride: false,
    notifications: {
      email: false,
      flaggedContent: false,
      weeklySummaries: false,
      aiUsageLimits: false,
      contentEdits: false,
    },
    exportFilters: {
      dateRange: 'all',
      course: ''
    }
  });

  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Real-time sync with backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/settings');

        if (!response.ok) {
          throw new Error('Failed to load settings');
        }

        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save settings to backend
  const saveSettings = async () => {
    try {
      setSaving(true);
      console.log("Settings being sent to API:", JSON.stringify(settings));
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const savedData = await response.json();
      console.log("Response from API:", savedData);
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Update settings locally
  const handleSettingChange = (setting, value) => {
    const newSettings = {
      ...settings,
      [setting]: value !== undefined ? value : !settings[setting]
    };

    // Handle lecture-level override dependency
    if (setting === 'allowCopyPaste' && !value) {
      newSettings.copyPasteLectureOverride = false;
    }

    setSettings(newSettings);
  };

  // Export settings as PDF
  const handleExportData = async () => {
    try {
      const response = await fetch('/api/settings/export');

      if (!response.ok) {
        throw new Error('Failed to export settings');
      }

      const data = await response.json();

      // Generate PDF on the client side
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text('Settings Export', 105, 20, { align: 'center' });

      // Add user info
      doc.setFontSize(12);
      doc.text(`User: ${data.user.name} (${data.user.email})`, 20, 40);

      // Content settings
      doc.setFontSize(16);
      doc.text('Content Settings', 20, 60);
      doc.setFontSize(12);
      doc.text(`Allow Copy/Paste: ${data.settings.allowCopyPaste ? 'Enabled' : 'Disabled'}`, 20, 70);
      doc.text(`Allow Lecture-Level Override: ${data.settings.copyPasteLectureOverride ? 'Enabled' : 'Disabled'}`, 20, 80);

      // Notification settings
      doc.setFontSize(16);
      doc.text('Notification Settings', 20, 100);
      doc.setFontSize(12);
      doc.text(`Email Notifications: ${data.settings.notifications.email ? 'Enabled' : 'Disabled'}`, 20, 110);
      doc.text(`Flagged Content Alerts: ${data.settings.notifications.flaggedContent ? 'Enabled' : 'Disabled'}`, 20, 120);
      doc.text(`Weekly Summaries: ${data.settings.notifications.weeklySummaries ? 'Enabled' : 'Disabled'}`, 20, 130);
      doc.text(`AI Usage Alerts: ${data.settings.notifications.aiUsageLimits ? 'Enabled' : 'Disabled'}`, 20, 140);
      doc.text(`Content Edit Notifications: ${data.settings.notifications.contentEdits ? 'Enabled' : 'Disabled'}`, 20, 150);

      // Export preferences
      doc.setFontSize(16);
      doc.text('Export Preferences', 20, 170);
      doc.setFontSize(12);
      doc.text(`Default Date Range: ${data.settings.exportFilters.dateRange}`, 20, 180);

      // Add generated date
      doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, 20, 200);

      // Save PDF
      doc.save('settings-export.pdf');

      toast.success('Settings exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export settings');
    }
  };


  // Reusable Toggle Component
  const Toggle = ({ label, checked, onChange, tooltip, children }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
          />
          <div className={`relative w-6 h-6 bg-gray-800 rounded-md border-2 flex items-center justify-center ${checked ? 'border-yellow-500' : 'border-gray-700'
            }`}>
            {checked && (
              <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </label>
        <label className="text-gray-300 font-medium">{label}</label>
        {tooltip && (
          <Tooltip text={tooltip}>
            <FiInfo className="text-gray-400 cursor-pointer" />
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 px-12">
        <div className="max-w-8xl mx-auto">
          <h1 className="text-2xl font-semibold text-white mb-6">General Settings</h1>
          <div className="bg-[#1C1C1C] rounded-2xl p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 px-12">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-6">General Settings</h1>

        <div className="bg-[#1C1C1C] rounded-2xl p-8 space-y-8">
          {/* Copy/Paste Settings */}
          <Toggle
            label="Allow copy/paste"
            checked={settings.allowCopyPaste}
            onChange={() => handleSettingChange('allowCopyPaste')}
            tooltip="Global copy/paste restriction setting. Disable to enforce across all lectures."
          >
            {settings.allowCopyPaste && (
              <div className="ml-10 space-y-3">
                <Toggle
                  label="Allow lecture-level override"
                  checked={settings.copyPasteLectureOverride}
                  onChange={() => handleSettingChange('copyPasteLectureOverride')}
                  tooltip="Let professors enable copy/paste for specific lectures"
                />
              </div>
            )}
          </Toggle>

          {/* Notifications */}
          <Toggle
            label="Email Notifications"
            checked={settings.notifications.email}
            onChange={() => handleSettingChange('notifications', {
              ...settings.notifications,
              email: !settings.notifications.email
            })}
            tooltip="Enable/disable all email notifications"
          >
            {settings.notifications.email && ( // Only show sub-options when email notifications are enabled
              <div className="ml-10 space-y-3">
                <Toggle
                  label="Flagged Content"
                  checked={settings.notifications.flaggedContent}
                  onChange={() => handleSettingChange('notifications', {
                    ...settings.notifications,
                    flaggedContent: !settings.notifications.flaggedContent
                  })}
                  tooltip="Receive alerts when content is flagged"
                />
                <Toggle
                  label="Weekly Summaries"
                  checked={settings.notifications.weeklySummaries}
                  onChange={() => handleSettingChange('notifications', {
                    ...settings.notifications,
                    weeklySummaries: !settings.notifications.weeklySummaries
                  })}
                  tooltip="Weekly digest of student activity"
                />
                <Toggle
                  label="AI Usage Alerts"
                  checked={settings.notifications.aiUsageLimits}
                  onChange={() => handleSettingChange('notifications', {
                    ...settings.notifications,
                    aiUsageLimits: !settings.notifications.aiUsageLimits
                  })}
                  tooltip="Notifications when AI usage limits are reached"
                />
                <Toggle
                  label="Content Edits"
                  checked={settings.notifications.contentEdits}
                  onChange={() => handleSettingChange('notifications', {
                    ...settings.notifications,
                    contentEdits: !settings.notifications.contentEdits
                  })}
                  tooltip="Alerts when others edit your content"
                />
              </div>
            )}
          </Toggle>


          {/* Export Preferences */}
          <div className="space-y-3">
            <h3 className="text-gray-300 font-medium">Export Preferences</h3>
            <div className="ml-10 space-y-3">
              <div className="space-y-2">
                <label className="text-gray-400 block">Default Date Range</label>
                <select
                  value={settings.exportFilters.dateRange}
                  onChange={(e) => handleSettingChange('exportFilters', {
                    ...settings.exportFilters,
                    dateRange: e.target.value
                  })}
                  className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-gray-300 focus:outline-none focus:border-yellow-500"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-4">
          <button
            onClick={handleExportData}
            className="bg-gray-800 text-yellow-500 px-6 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FiDownload /> Export Data
          </button>

          <button
            onClick={saveSettings}
            disabled={saving}
            className={`bg-yellow-500 text-black px-6 py-2 rounded-md hover:bg-yellow-600 transition-colors flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;