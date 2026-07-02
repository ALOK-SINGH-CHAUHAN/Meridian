"use client";

import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { 
  ShieldAlert, 
  Monitor, 
  User, 
  Check, 
  KeyRound, 
  Database,
  Mail,
  Calendar,
  Clock,
  CircleUser,
  Sliders,
  Bell,
  Trash2,
  HardDrive,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { tasks, employees, logActivity, density, setDensity } = useAppData();
  
  // Storage states
  const [storageSize, setStorageSize] = useState("0 KB");
  const [lastUpdated, setLastUpdated] = useState("Just now");


  // Custom mock switch states
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [desktopNotifs, setDesktopNotifs] = useState(true);

  // Load saved configurations
  useEffect(() => {
    if (typeof window !== "undefined") {

      // Estimate local storage size
      let totalBytes = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalBytes += ((localStorage[key] || "").length + key.length) * 2;
        }
      }
      if (totalBytes > 1024 * 1024) {
        setStorageSize((totalBytes / (1024 * 1024)).toFixed(2) + " MB");
      } else {
        setStorageSize((totalBytes / 1024).toFixed(1) + " KB");
      }
    }
  }, [tasks, employees]);

  // Demo data resets
  const handleResetData = () => {
    if (typeof window !== "undefined" && window.confirm("Are you sure you want to restore default system database values? This will reload the page.")) {
      localStorage.removeItem('meridian_data');
      logActivity('status_changed', 'System settings were reset to default demo data');
      window.location.reload();
    }
  };

  const handleClearLocalStorage = () => {
    if (typeof window !== "undefined" && window.confirm("Are you sure you want to clear all Local Storage database configurations? All custom tasks will be deleted.")) {
      localStorage.clear();
      window.location.reload();
    }
  };



  // Toggle Switch Component helper
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20 ${
        checked ? 'bg-blue-accent' : 'bg-fog border border-hairline/45'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white dark:bg-zinc-200 rounded-full transition-transform duration-200 ease-out transform ${
          checked ? 'translate-x-4.5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col gap-1 mt-2 cursor-default pb-4">
        <span className="text-[12px] uppercase tracking-widest font-bold text-text-graphite">
          Preferences
        </span>
        <h1 className="text-[28px] font-bold text-text-primary tracking-tight">
          System Settings
        </h1>
        <p className="text-[13px] text-text-graphite">Manage application preferences, workforce variables, and administrator options</p>
      </div>

      {/* Main Single Column Layout with 32px (space-y-8) separation */}
      <div className="max-w-[720px] flex flex-col gap-8 pb-12">
        
        {/* Appearance Settings Card */}
        <Card className="flex flex-col gap-5">
          <div className="flex items-start gap-3.5 border-b border-hairline/15 pb-4 cursor-default">
            <div className="p-2 bg-fog rounded-full text-text-ash">
              <Monitor className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15.5px] font-bold text-text-primary">
                Appearance & Accessibility
              </h3>
              <p className="text-[13px] text-text-ash mt-0.5">
                Customize the visual interface density and color accents.
              </p>
            </div>
          </div>

          {/* Premium Segmented Theme Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
            <div className="flex flex-col gap-0.5 cursor-default">
              <span className="text-[14px] font-semibold text-text-primary">
                Interface Color Scheme
              </span>
              <span className="text-[12px] text-text-graphite">
                Choose light or dark visual layouts.
              </span>
            </div>

            {/* Segmented controls button container */}
            <div className="flex bg-fog p-1 rounded-xl border border-hairline/40 w-max self-start sm:self-auto select-none">
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  theme === 'light' 
                    ? 'bg-card text-blue-accent shadow-sm border border-hairline/20 font-extrabold' 
                    : 'text-text-graphite hover:text-text-primary'
                }`}
              >
                ☀ Light
              </button>
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-card text-blue-accent shadow-sm border border-hairline/20 font-extrabold' 
                    : 'text-text-graphite hover:text-text-primary'
                }`}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          {/* Density Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-hairline/10">
            <div className="flex flex-col gap-0.5 cursor-default">
              <span className="text-[14px] font-semibold text-text-primary">Interface Density</span>
              <span className="text-[12px] text-text-graphite">Adjust how compact or spacious the UI elements appear.</span>
            </div>
            <div className="flex bg-fog p-0.5 rounded-xl border border-hairline/40 w-max self-start sm:self-auto select-none">
              <button
                onClick={() => setDensity('standard')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                  density === 'standard'
                    ? 'bg-card text-text-primary shadow-sm border border-hairline/20 font-extrabold'
                    : 'text-text-graphite hover:text-text-primary'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setDensity('compact')}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                  density === 'compact'
                    ? 'bg-card text-text-primary shadow-sm border border-hairline/20 font-extrabold'
                    : 'text-text-graphite hover:text-text-primary'
                }`}
              >
                Compact
              </button>
            </div>
          </div>
        </Card>

        {/* User Account Settings */}
        <Card className="flex flex-col gap-5">
          <div className="flex items-start gap-3.5 border-b border-hairline/15 pb-4 cursor-default">
            <div className="p-2 bg-fog rounded-full text-text-ash">
              <CircleUser className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15.5px] font-bold text-text-primary">
                Operator Profile
              </h3>
              <p className="text-[13px] text-text-ash mt-0.5">
                Active directory administrator identity credentials.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start py-2">
            {/* Monogram profile avatar */}
            <div className="w-16 h-16 rounded-full bg-sky flex items-center justify-center text-[22px] font-bold text-[#2563eb] cursor-default ring-2 ring-blue-500/10 shadow-inner shrink-0">
              AS
            </div>

            {/* Operator info details */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full cursor-default">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wide">Full Name</span>
                <span className="text-[13.5px] text-text-primary font-semibold">Alok Singh Chauhan</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wide">Role Scope</span>
                <span className="text-[13.5px] text-text-primary font-semibold">Workforce Administrator</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wide">Contact Email</span>
                <span className="text-[13.5px] text-text-primary font-semibold flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-text-graphite" />
                  alok.singh@meridian.com
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wide">Last Session Login</span>
                <span className="text-[13.5px] text-text-primary font-semibold flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-text-graphite" />
                  Today, 19:03 (Local time)
                </span>
              </div>
              <div className="flex flex-col gap-0.5 border-t border-hairline/10 pt-2 sm:col-span-2 grid grid-cols-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wide">Department Scope</span>
                  <span className="text-[13px] text-text-primary font-semibold">Workspace Operations</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wide">Account Created</span>
                  <span className="text-[13px] text-text-primary font-semibold">Jan 12, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Live System Information Card */}
        <Card className="flex flex-col gap-5">
          <div className="flex items-start gap-3.5 border-b border-hairline/15 pb-4 cursor-default">
            <div className="p-2 bg-fog rounded-full text-text-ash">
              <Sliders className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15.5px] font-bold text-text-primary">
                System Information
              </h3>
              <p className="text-[13px] text-text-ash mt-0.5">
                Ops board server configuration details and resource counts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 cursor-default">
            <div className="bg-fog p-3.5 rounded-xl border border-hairline/10 text-center">
              <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider block">App Version</span>
              <span className="text-[16px] font-extrabold text-text-primary mt-1 block">v1.0.0</span>
            </div>
            
            <div className="bg-fog p-3.5 rounded-xl border border-hairline/10 text-center">
              <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider block">Storage capacity</span>
              <span className="text-[16px] font-extrabold text-blue-accent mt-1 block">92%</span>
            </div>

            <div className="bg-fog p-3.5 rounded-xl border border-hairline/10 text-center">
              <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider block">Live Tasks</span>
              <span className="text-[16px] font-extrabold text-text-primary mt-1 block">{tasks.length}</span>
            </div>

            <div className="bg-fog p-3.5 rounded-xl border border-hairline/10 text-center">
              <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider block">Team Members</span>
              <span className="text-[16px] font-extrabold text-text-primary mt-1 block">{employees.length}</span>
            </div>
          </div>
        </Card>

        {/* Security & Compliance Card */}
        <Card className="flex flex-col gap-5">
          <div className="flex items-start gap-3.5 border-b border-hairline/15 pb-4 cursor-default">
            <div className="p-2 bg-fog rounded-full text-text-ash">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15.5px] font-bold text-text-primary">
                Compliance & Security
              </h3>
              <p className="text-[13px] text-text-ash mt-0.5">
                Audited security configurations of database sandboxes.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 cursor-default">
            {/* System Status: Healthy */}
            <div className="flex items-center justify-between py-3 border-b border-hairline/20">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-semibold text-text-primary">System Status</span>
                  <span className="text-[11px] text-text-graphite">Real-time validation of local databases</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Healthy
              </span>
            </div>

            {/* Last security scan */}
            <div className="flex items-center justify-between py-3 border-b border-hairline/20">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-semibold text-text-primary">Last Security Scan</span>
                  <span className="text-[11px] text-text-graphite">Full database vulnerability scanning completed</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                2 mins ago
              </span>
            </div>

            {/* Access logging */}
            <div className="flex items-center justify-between py-3 border-b border-hairline/20">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-semibold text-text-primary">Access Event Logging</span>
                  <span className="text-[11px] text-text-graphite">Immutable security event histories</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Enabled
              </span>
            </div>

            {/* Encryption Standard */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                  <Database className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-semibold text-text-primary">Local Storage Encryption</span>
                  <span className="text-[11px] text-text-graphite">State payloads encrypted inside sandbox</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                AES-256
              </span>
            </div>
          </div>
        </Card>

        {/* Notifications Preference Card with Toggle Switches */}
        <Card className="flex flex-col gap-5">
          <div className="flex items-start gap-3.5 border-b border-hairline/15 pb-4 cursor-default">
            <div className="p-2 bg-fog rounded-full text-text-ash">
              <Bell className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15.5px] font-bold text-text-primary">
                Notification Channels
              </h3>
              <p className="text-[13px] text-text-ash mt-0.5">
                Configure channels where tasks and updates will trigger alerts.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 cursor-default">
            <div className="flex items-center justify-between py-2 border-b border-hairline/15">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold text-text-primary">Email Notifications</span>
                <span className="text-[11.5px] text-text-graphite">Send daily workforce capacity updates</span>
              </div>
              <ToggleSwitch checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-hairline/15">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold text-text-primary">Push Alerts</span>
                <span className="text-[11.5px] text-text-graphite">Direct browser notifications on status updates</span>
              </div>
              <ToggleSwitch checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-semibold text-text-primary">Desktop Alerts</span>
                <span className="text-[11.5px] text-text-graphite">Trigger operating system banner alerts</span>
              </div>
              <ToggleSwitch checked={desktopNotifs} onChange={() => setDesktopNotifs(!desktopNotifs)} />
            </div>
          </div>
        </Card>

        {/* Local Storage & Cache Card */}
        <Card className="flex flex-col gap-5">
          <div className="flex items-start gap-3.5 border-b border-hairline/15 pb-4 cursor-default">
            <div className="p-2 bg-fog rounded-full text-text-ash">
              <HardDrive className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[15.5px] font-bold text-text-primary">
                Local Storage Sandbox
              </h3>
              <p className="text-[13px] text-text-ash mt-0.5">
                Analyze local client state payload footprint.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 cursor-default">
            <div className="flex justify-between items-center text-[13px] border-b border-hairline/10 pb-3">
              <span className="font-semibold text-text-primary">Total Cached Space</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-text-graphite font-semibold">Last Updated: {lastUpdated}</span>
                <span className="font-extrabold text-blue-accent">{storageSize}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-text-graphite">Tasks Dataset</span>
                <span className="font-bold text-text-primary">{(tasks.length * 0.4).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-text-graphite">Employees Directory</span>
                <span className="font-bold text-text-primary">{(employees.length * 0.3).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-text-graphite">System Configuration & Theme</span>
                <span className="font-bold text-text-primary">0.80 KB</span>
              </div>
            </div>
          </div>
        </Card>


        
      </div>
    </PageWrapper>
  );
}
