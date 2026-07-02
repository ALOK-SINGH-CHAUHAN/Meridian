"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Users, Settings, Menu, X, Globe, Compass, Database, BarChart3, TrendingUp } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { tasks, employees } = useAppData();
  const [progressWidth, setProgressWidth] = useState('0%');

  useEffect(() => {
    const timer = setTimeout(() => setProgressWidth('92%'), 300);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Reports', href: '#', icon: BarChart3, disabled: true },
    { name: 'Analytics', href: '#', icon: TrendingUp, disabled: true },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const quickLinks = [
    { name: 'Codebase Repo', href: '#', icon: Globe },
    { name: 'Operations Specs', href: '#', icon: Compass }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-fog p-5 pb-12">
      {/* Brand logo */}
      <div className="mb-8 pl-2 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-accent flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Database className="w-4 h-4" />
        </div>
        <h1 className="text-[20px] font-semibold text-text-primary tracking-tight">
          Meridian
        </h1>
      </div>

      {/* Nav list with distinct active states */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.name}
                title={`${item.name} module is planned for a future release`}
                className="flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl text-text-graphite/35 cursor-not-allowed select-none hover:bg-fog/10 transition-all"
              >
                <item.icon className="w-4 h-4 opacity-40" />
                {item.name}
                <span className="ml-auto text-[9px] uppercase tracking-wider font-bold bg-hairline/20 px-1.5 py-0.5 rounded text-text-graphite/45">
                  Soon
                </span>
              </div>
            );
          }
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-accent text-white shadow-md shadow-blue-500/20'
                  : 'text-text-ash hover:text-text-primary hover:bg-card/40'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Storage Tracker */}
      <div className="mt-auto pt-6 border-t border-hairline/25 pb-4">
        <div className="px-4">
          <div className="flex justify-between items-end text-[10.5px] font-bold uppercase tracking-wider mb-2">
            <span className="text-text-graphite">Storage</span>
            <span className="text-blue-accent">92%</span>
          </div>
          <div className="w-full bg-hairline/60 h-1 rounded-full overflow-hidden mb-3">
            <div className="bg-blue-accent h-full rounded-full transition-all duration-500" style={{ width: progressWidth }} />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-text-ash">
            <span>Tasks: <strong className="text-text-primary">{tasks.length}</strong></span>
            <span>Employees: <strong className="text-text-primary">{employees.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-[224px] fixed top-0 bottom-0 left-0 border-r border-hairline/10 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-between bg-fog border-b border-hairline/10 px-4 py-3 sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-accent flex items-center justify-center text-white">
            <Database className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">
            Meridian
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-text-primary hover:text-rust p-1 rounded-lg cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Drawer scrim */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-35 bg-[#17191c]/40 dark:bg-black/60 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer content */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 w-[224px] z-40 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
