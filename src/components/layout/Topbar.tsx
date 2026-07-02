"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { Sun, Moon, Bell, Search, ChevronRight } from 'lucide-react';

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { tasks, employees } = useAppData();
  
  const [notifications, setNotifications] = useState(3);
  const [topSearch, setTopSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    if (pathname === '/tasks') return { root: 'Tasks', rootHref: '/tasks', active: 'Workspace' };
    if (pathname === '/employees') return { root: 'Employees', rootHref: '/employees', active: 'Directory' };
    if (pathname === '/settings') return { root: 'Settings', rootHref: '/settings', active: 'System Preferences' };
    return { root: 'Dashboard', rootHref: '/', active: 'Overview' };
  };

  const breadcrumbs = getBreadcrumbs();

  // Matched items
  const matchedTasks = topSearch.trim()
    ? tasks.filter(t => t.title.toLowerCase().includes(topSearch.toLowerCase())).slice(0, 3)
    : [];

  const matchedEmployees = topSearch.trim()
    ? employees.filter(e => e.name.toLowerCase().includes(topSearch.toLowerCase())).slice(0, 3)
    : [];

  const showDropdown = isFocused && (matchedTasks.length > 0 || matchedEmployees.length > 0);

  return (
    <header className="sticky top-0 bg-canvas/80 backdrop-blur-md border-b border-hairline h-16 flex items-center justify-between px-6 z-30">
      {/* Breadcrumbs & Badges */}
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-text-graphite cursor-default select-none">
        <Link href={breadcrumbs.rootHref} className="hover:text-text-primary hover:underline transition-colors">
          {breadcrumbs.root}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-text-primary font-bold">{breadcrumbs.active}</span>
        
        <span className="hidden sm:inline-flex items-center ml-3 px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] font-extrabold uppercase tracking-wider">
          Ops Control
        </span>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold uppercase tracking-wider">
          Demo Mode
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Working Search Bar */}
        <div className="relative hidden md:block" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Search tasks, employees..."
            value={topSearch}
            onChange={(e) => setTopSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="bg-fog border border-hairline rounded-lg pl-8 pr-3 py-1.5 text-[11px] placeholder-text-graphite w-[180px] focus:w-[220px] focus:outline-none focus:border-blue-accent transition-all text-text-primary"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-graphite" />

          {/* Matches Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-hairline rounded-[12px] shadow-lg p-3 flex flex-col gap-3 z-50">
              {matchedTasks.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-text-graphite uppercase tracking-wider pl-1 mb-1 block">Tasks</span>
                  {matchedTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        router.push(`/tasks?search=${encodeURIComponent(t.title)}`);
                        setTopSearch('');
                        setIsFocused(false);
                      }}
                      className="flex flex-col text-left w-full px-2.5 py-1.5 rounded-lg hover:bg-blue-accent/10 transition-colors cursor-pointer group"
                    >
                      <span className="text-[12px] font-semibold text-text-primary group-hover:text-blue-accent truncate">{t.title}</span>
                      <span className="text-[10px] text-text-graphite line-clamp-1 mt-0.5">{t.description}</span>
                    </button>
                  ))}
                </div>
              )}

              {matchedEmployees.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-text-graphite uppercase tracking-wider pl-1 mb-1 block">Employees</span>
                  {matchedEmployees.map(e => (
                    <button
                      key={e.id}
                      onClick={() => {
                        router.push(`/employees?search=${encodeURIComponent(e.name)}`);
                        setTopSearch('');
                        setIsFocused(false);
                      }}
                      className="flex items-center gap-2.5 text-left w-full px-2.5 py-1.5 rounded-lg hover:bg-blue-accent/10 transition-colors cursor-pointer group"
                    >
                      <img src={e.avatarUrl} alt={e.name} className="w-5.5 h-5.5 rounded-full object-cover" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-semibold text-text-primary group-hover:text-blue-accent truncate">{e.name}</span>
                        <span className="text-[10px] text-text-graphite truncate">{e.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setNotifications(0)}
          className="relative text-text-graphite hover:text-text-primary p-2 rounded-full cursor-pointer hover:bg-fog transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
          )}
        </button>

        <button
          onClick={toggleTheme}
          className="text-text-graphite hover:text-text-primary p-2 rounded-full cursor-pointer hover:bg-fog transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2 border-l border-hairline/20 pl-3 cursor-default">
          <div className="w-7 h-7 rounded-full bg-sky flex items-center justify-center text-[11px] font-bold text-[#2563eb]">
            AS
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[11px] font-bold text-text-primary leading-none">Alok Singh</span>
            <span className="text-[9px] text-text-graphite font-semibold mt-0.5 leading-none">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
