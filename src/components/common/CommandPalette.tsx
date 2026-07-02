"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { Search, Monitor, Users, CheckSquare, Settings, Command } from 'lucide-react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setQuery('');
  };

  const executeAction = (action: () => void) => {
    action();
    setIsOpen(false);
    setQuery('');
  };

  const commands = [
    { name: 'Navigate to Dashboard', icon: Monitor, action: () => navigate('/') },
    { name: 'Navigate to Tasks Workspace', icon: CheckSquare, action: () => navigate('/tasks') },
    { name: 'Navigate to Employee Directory', icon: Users, action: () => navigate('/employees') },
    { name: 'Navigate to System Settings', icon: Settings, action: () => navigate('/settings') },
    { name: 'Switch Theme (Light/Dark)', icon: Command, action: () => executeAction(toggleTheme) },
  ];

  const matchedCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div
        className="fixed inset-0 bg-[#17191c]/30 dark:bg-black/50 backdrop-blur-xs"
        onClick={() => setIsOpen(false)}
      />

      <div className="bg-card w-full max-w-lg rounded-2xl border border-hairline shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-10 flex flex-col">
        <div className="relative border-b border-hairline p-4 flex items-center">
          <Search className="w-5 h-5 text-text-graphite mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[14px] text-text-primary focus:outline-none placeholder-text-graphite"
          />
        </div>

        <div className="p-2 max-h-[250px] overflow-y-auto scroller">
          {matchedCommands.length === 0 ? (
            <div className="text-[13px] text-text-graphite text-center py-6">
              No commands found. Try typing 'navigate' or 'theme'.
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {matchedCommands.map((c, i) => (
                <button
                  key={i}
                  onClick={c.action}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left text-[13px] text-text-primary rounded-lg hover:bg-blue-accent hover:text-white transition-colors cursor-pointer group"
                >
                  <c.icon className="w-4 h-4 text-text-graphite group-hover:text-white" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-fog px-4 py-2 border-t border-hairline flex items-center justify-between text-[11px] text-text-graphite">
          <span>Search or click to select</span>
          <span>esc to close · ⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}
