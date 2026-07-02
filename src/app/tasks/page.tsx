"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '../../context/AppDataContext';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { isPastDate } from '../../utils/dateHelpers';
import { Task, TaskStatus, Priority } from '../../types';
import { 
  Search, 
  Plus, 
  Calendar, 
  ArrowRightLeft, 
  FolderX, 
  LayoutGrid, 
  List,
  CheckCircle,
  BellRing,
  Info,
  SlidersHorizontal,
  Trash2,
  Edit,
  MoreVertical,
  Check,
  ClipboardList,
  Flame,
  Clock3,
  TriangleAlert,
  Copy,
  GripVertical
} from 'lucide-react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  useDroppable,
  useDraggable
} from '@dnd-kit/core';

// Eased Animated Number Component for Stat HUD
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    
    const duration = 400; // ms
    const startTime = performance.now();
    let animationFrameId: number;
    
    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // Ease out quad
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);
  
  return <>{displayValue}</>;
}

// Droppable Lane wrapper
function DroppableColumn({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-blue-accent/25 bg-fog/80' : ''} transition-all duration-200`}
    >
      {children}
    </div>
  );
}

// Draggable Card wrapper
function DraggableCard({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 1,
  } : undefined;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${className} ${isDragging ? 'cursor-grabbing shadow-2xl scale-[1.01]' : 'cursor-grab hover:-translate-y-0.5'}`}
    >
      {children}
    </div>
  );
}

// Custom Urgency Badge for Task Cards — consistent h-5 pill height
function PriorityBadge({ value }: { value: Priority }) {
  const base = 'inline-flex items-center h-5 px-2 text-[9px] font-extrabold uppercase rounded border tracking-wide whitespace-nowrap';
  if (value === 'high') {
    return (
      <span title="High priority" className={`${base} bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400`}>
        🔴 High
      </span>
    );
  }
  if (value === 'medium') {
    return (
      <span title="Medium priority" className={`${base} bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400`}>
        🟡 Med
      </span>
    );
  }
  return (
    <span title="Low priority" className={`${base} bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400`}>
      🟢 Low
    </span>
  );
}

// Dynamic Urgency Due Date indicator — compact badge format
function DueDateIndicator({ dueDate, status }: { dueDate: string; status: TaskStatus }) {
  const base = 'inline-flex items-center h-5 px-2 text-[9px] font-bold rounded border whitespace-nowrap';

  if (status === 'done') {
    return (
      <span className={`${base} bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400`} title="Completed">
        ✓ Done
      </span>
    );
  }

  if (!dueDate) return null;

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const formatted = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  if (diffDays < 0) {
    const cls = diffDays < -7
      ? 'bg-red-900/20 border-red-700/40 text-red-700 dark:text-red-400'
      : diffDays < -2
      ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
      : 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400';
    return (
      <span className={`${base} ${cls} animate-pulse`} title={`Overdue since ${formatted}`}>
        🔴 {formatted}
      </span>
    );
  }
  if (diffDays === 0) {
    return (
      <span className={`${base} bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400`} title="Due Today">
        ⏳ Today
      </span>
    );
  }
  if (diffDays === 1) {
    return (
      <span className={`${base} bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400`} title="Due Tomorrow">
        🟡 Tomorrow
      </span>
    );
  }
  return (
    <span className={`${base} bg-fog border-hairline/50 text-text-graphite`} title={`Due ${formatted}`}>
      📅 {formatted}
    </span>
  );
}

// Simulated dynamic time ago label
function getTimeAgo(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours <= 0) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins || 2}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${Math.floor(diffHours / 24)}d ago`;
}

// Dept badge — consistent pill, color-coded
function DeptBadge({ dept }: { dept: string | undefined }) {
  const base = 'inline-flex items-center h-5 px-3 text-[9px] font-bold rounded-full whitespace-nowrap border';
  const map: Record<string, string> = {
    Engineering: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700/40 dark:text-blue-300',
    Product:     'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700/40 dark:text-purple-300',
    Design:      'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/30 dark:border-pink-700/40 dark:text-pink-300',
    Security:    'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700/40 dark:text-amber-300',
    Operations:  'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700/40 dark:text-emerald-300',
  };
  const cls = dept ? (map[dept] ?? 'bg-fog border-hairline text-text-graphite') : 'bg-fog border-hairline text-text-graphite';
  return <span className={`${base} ${cls}`}>{dept ?? 'N/A'}</span>;
}

function highlightSearchMatches(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-950/65 dark:text-yellow-200 text-yellow-950 px-0.5 rounded font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function TasksPageInner() {
  const { 
    tasks, 
    employees, 
    addTask, 
    updateTaskStatus,
    deleteTask,
    updateTask,
    bulkDeleteTasks,
    bulkUpdateTasks,
    duplicateTask,
    searchFilter: search,
    setSearchFilter: setSearch,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    deptFilter,
    setDeptFilter
  } = useAppData();
  
  const searchParams = useSearchParams();
  const searchQueryParam = searchParams ? searchParams.get('search') : '';
  const searchInputRef = useRef<HTMLInputElement>(null);

  // View toggle & Local Sort
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [sortBy, setSortBy] = useState('dueDate-asc');
  
  // Collapse Columns State
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({
    todo: false,
    'in-progress': false,
    done: false
  });

  // Modal, editing & multi-select state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium' as Priority,
    dueDate: '',
    status: 'todo' as TaskStatus
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Keyboard Shortcuts (N -> new task, / -> search, Esc -> close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || 
                      e.target instanceof HTMLTextAreaElement || 
                      e.target instanceof HTMLSelectElement;
      
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        setActiveMenuTaskId(null);
        return;
      }

      if (isInput) return;

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter chips sync
  const activeChipsCount = 
    (search ? 1 : 0) + 
    (priorityFilter !== 'all' ? 1 : 0) + 
    (statusFilter !== 'all' ? 1 : 0) + 
    (deptFilter !== 'all' ? 1 : 0);

  const handleClearFilters = () => {
    setSearch('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setDeptFilter('all');
  };

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (searchQueryParam) {
      setSearch(searchQueryParam);
    }
  }, [searchQueryParam]);

  // Handle click outside to close ⋮ menu
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuTaskId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Sensor setups for Dnd-Kit Pointer constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const taskId = active.id as string;
    const targetStatus = over.id as TaskStatus;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status !== targetStatus) {
      updateTaskStatus(taskId, targetStatus);
      triggerToast(`Moved "${task.title.substring(0, 15)}..." to ${targetStatus.replace('-', ' ')}`, 'info');
    }
  };

  // Filter & sort calculations
  const filteredAndSortedTasks = tasks
    .filter((t) => {
      const assignee = employees.find(e => e.id === t.assigneeId);
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            t.description.toLowerCase().includes(search.toLowerCase()) ||
                            (assignee && assignee.name.toLowerCase().includes(search.toLowerCase()));
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'todo') {
          matchesStatus = t.status === 'todo' || t.status === 'overdue';
        } else {
          matchesStatus = t.status === statusFilter;
        }
      }

      const matchesDept = deptFilter === 'all' || (assignee && assignee.department === deptFilter);

      return matchesSearch && matchesPriority && matchesStatus && matchesDept;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate-asc') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'dueDate-desc') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const getTasksByColumn = (columnStatus: 'todo' | 'in-progress' | 'done') => {
    return filteredAndSortedTasks.filter((t) => {
      if (columnStatus === 'todo') {
        return t.status === 'todo' || t.status === 'overdue';
      }
      return t.status === columnStatus;
    });
  };

  // Quick stats values
  const totalCount = tasks.length;
  const activeCount = tasks.filter(t => t.status !== 'done').length;
  const highCount = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const dueTodayCount = tasks.filter(t => {
    if (t.status === 'done' || !t.dueDate) return false;
    return new Date(t.dueDate).toDateString() === new Date().toDateString();
  }).length;
  const overdueCount = tasks.filter(t => {
    if (t.status === 'done' || !t.dueDate) return false;
    const due = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    return due < today;
  }).length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!newTask.title.trim()) errors.title = 'Title is required';
    if (!newTask.description.trim()) errors.description = 'Description is required';
    if (!newTask.assigneeId) errors.assigneeId = 'Assignee is required';
    if (!newTask.dueDate) {
      errors.dueDate = 'Due date is required';
    } else if (isPastDate(newTask.dueDate)) {
      errors.dueDate = 'Due date cannot be in the past';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    addTask({
      title: newTask.title,
      description: newTask.description,
      assigneeId: newTask.assigneeId,
      priority: newTask.priority,
      status: newTask.status,
      dueDate: new Date(newTask.dueDate).toISOString()
    });

    triggerToast(`Task "${newTask.title.substring(0, 18)}..." created successfully`, 'success');

    setNewTask({
      title: '',
      description: '',
      assigneeId: '',
      priority: 'medium',
      dueDate: '',
      status: 'todo'
    });
    setValidationErrors({});
    setIsModalOpen(false);
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask(editingTask);
    triggerToast(`Saved changes to "${editingTask.title.substring(0, 18)}..."`, 'success');
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleToggleSelectCard = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(prev => [...prev, taskId]);
    } else {
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    }
  };

  const toggleCollapseColumn = (column: string) => {
    setCollapsedColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <PageWrapper>
      {/* Toast Notification HUD */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border border-hairline ${
            toast.type === 'success' 
              ? 'bg-green-50 text-green-800 dark:bg-green-950/60 dark:text-green-300' 
              : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            <span className="text-[13px] font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
        <div className="flex flex-col gap-1 cursor-default">
          <span className="text-[12px] uppercase tracking-widest font-bold text-text-graphite">
            Workspace
          </span>
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight">
            Tasks Control
          </h1>
          <span className="text-[13px] text-text-graphite">Manage assignments across departments</span>
        </div>

        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 shadow-sm shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          New Task
        </Button>
      </div>

      {/* Quick Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
        <Card className="!p-4 flex items-center justify-between hover:border-blue-accent/25 transition-all">
          <div className="flex flex-col gap-0.5 cursor-default">
            <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider">Total Active</span>
            <span className="text-[24px] font-bold text-text-primary"><AnimatedNumber value={activeCount} /></span>
          </div>
          <ClipboardList className="w-6 h-6 text-blue-500" />
        </Card>
        
        <Card className="!p-4 flex items-center justify-between hover:border-red-500/25 transition-all">
          <div className="flex flex-col gap-0.5 cursor-default">
            <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider">High Priority</span>
            <span className="text-[24px] font-bold text-red-500"><AnimatedNumber value={highCount} /></span>
          </div>
          <Flame className="w-6 h-6 text-red-500" />
        </Card>

        <Card className="!p-4 flex items-center justify-between hover:border-orange-500/25 transition-all">
          <div className="flex flex-col gap-0.5 cursor-default">
            <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider">Due Today</span>
            {dueTodayCount > 0 ? (
              <span className="text-[24px] font-bold text-orange-500"><AnimatedNumber value={dueTodayCount} /></span>
            ) : (
              <span className="text-[11px] font-semibold text-text-graphite/60 mt-1">No tasks due today</span>
            )}
          </div>
          <Clock3 className="w-6 h-6 text-orange-500" />
        </Card>

        <Card className="!p-4 flex items-center justify-between hover:border-red-600/25 transition-all">
          <div className="flex flex-col gap-0.5 cursor-default">
            <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider">Overdue Tasks</span>
            <span className="text-[24px] font-bold text-red-600"><AnimatedNumber value={overdueCount} /></span>
          </div>
          <TriangleAlert className="w-6 h-6 text-red-600" />
        </Card>
      </div>

      {/* Sticky Filter and Controls Bar */}
      <Card className="p-4 md:p-5 flex flex-col gap-3 mt-3 sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-hairline/25 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Bar */}
          <div className="relative lg:col-span-4 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-text-graphite/60" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search title, description, or assignee... (Press '/')"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-fog rounded-[12px] border border-hairline/10 pl-10 pr-4 py-2.5 text-[13px] placeholder-text-graphite/60 text-text-primary focus:outline-none focus:border-blue-accent transition-colors"
            />
          </div>

          {/* Select selectors */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-card text-text-primary rounded-[12px] border border-hairline px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-blue-accent transition-colors cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card text-text-primary rounded-[12px] border border-hairline px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-blue-accent transition-colors cursor-pointer"
            >
              <option value="all">All Lanes</option>
              <option value="todo">Todo/Overdue</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-card text-text-primary rounded-[12px] border border-hairline px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-blue-accent transition-colors cursor-pointer"
            >
              <option value="all">All Depts</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Security">Security</option>
              <option value="Operations">Operations</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-card text-text-primary rounded-[12px] border border-hairline px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-blue-accent transition-colors cursor-pointer"
            >
              <option value="dueDate-asc">Due Date (Asc)</option>
              <option value="dueDate-desc">Due Date (Desc)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="lg:col-span-2 flex items-center justify-end w-full gap-1 border-t lg:border-t-0 pt-3 lg:pt-0 border-hairline/20">
            <span className="text-[11px] font-bold text-text-graphite uppercase mr-2 cursor-default">View:</span>
            <button
              onClick={() => setViewMode('board')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'board' 
                  ? 'bg-blue-accent text-white' 
                  : 'bg-fog text-text-ash hover:text-text-primary'
              }`}
              title="Board Layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-blue-accent text-white' 
                  : 'bg-fog text-text-ash hover:text-text-primary'
              }`}
              title="Table List Layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter chips strip */}
        {activeChipsCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-1 pt-1 border-t border-hairline/10 animate-in fade-in duration-300">
            <span className="text-[10px] font-bold text-text-graphite uppercase mr-1">Active:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-fog border border-hairline/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-text-primary">
                Text: "{search}"
                <button onClick={() => setSearch('')} className="text-text-ash hover:text-red-500 font-bold ml-0.5">×</button>
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-fog border border-hairline/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-text-primary">
                Priority: {priorityFilter}
                <button onClick={() => setPriorityFilter('all')} className="text-text-ash hover:text-red-500 font-bold ml-0.5">×</button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-fog border border-hairline/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-text-primary">
                Lane: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="text-text-ash hover:text-red-500 font-bold ml-0.5">×</button>
              </span>
            )}
            {deptFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-fog border border-hairline/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-text-primary">
                Dept: {deptFilter}
                <button onClick={() => setDeptFilter('all')} className="text-text-ash hover:text-red-500 font-bold ml-0.5">×</button>
              </span>
            )}
            <button 
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-blue-accent hover:underline ml-2"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </Card>

      {/* Kanban Board DndContext wrapper */}
      {viewMode === 'board' ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex flex-col md:flex-row gap-4 items-stretch mt-4 overflow-x-auto pb-4 max-w-full scroller scrollbar-thin animate-in fade-in duration-300">
            {(['todo', 'in-progress', 'done'] as const).map((col) => {
              const colTasks = getTasksByColumn(col);
              const colLabel = col === 'todo' ? 'Todo' : col === 'in-progress' ? 'In Progress' : 'Done';
              const colEmoji = col === 'todo' ? '📝' : col === 'in-progress' ? '⚡' : '✅';
              const totalActiveInLane = colTasks.length;
              
              if (collapsedColumns[col]) {
                return (
                  <div 
                    key={col} 
                    onClick={() => toggleCollapseColumn(col)}
                    className="bg-fog/50 dark:bg-card/20 rounded-[20px] p-4 py-4 md:py-6 flex flex-row md:flex-col items-center justify-between md:justify-start gap-4 border border-hairline/10 w-full md:w-14 shrink-0 cursor-pointer hover:bg-fog transition-all self-stretch h-14 md:h-[680px]"
                    title="Click to expand lane"
                  >
                    <span className="text-[14px] font-bold text-text-primary">▶</span>
                    <div className="flex flex-row md:flex-col gap-1 items-center font-bold text-text-graphite text-[11px] uppercase tracking-wider select-none md:[writing-mode:vertical-lr] md:rotate-180">
                      {colLabel} <span className="ml-2 md:ml-0 md:mt-2 text-blue-accent">({totalActiveInLane})</span>
                    </div>
                  </div>
                );
              }

              return (
                <DroppableColumn 
                  key={col} 
                  id={col}
                  className={`bg-fog rounded-[20px] p-5 flex flex-col border border-hairline/10 h-[680px] min-h-[500px] w-full md:w-[360px] md:min-w-[360px] md:flex-1 shrink-0 transition-all duration-300 ${
                    col === 'todo' ? 'border-t-[3px] border-t-zinc-400' :
                    col === 'in-progress' ? 'border-t-[3px] border-t-blue-500' :
                    'border-t-[3px] border-t-green-500'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex flex-col gap-2 border-b border-hairline/25 pb-3 mb-3 shrink-0">
                    <div className="flex items-center justify-between gap-4">
                      <div 
                        className="flex items-center gap-2 cursor-pointer select-none shrink-0" 
                        onClick={() => toggleCollapseColumn(col)}
                        title="Click to collapse lane"
                      >
                        <span className="text-[11px] text-text-graphite hover:text-text-primary">▼</span>
                        <h3 className="text-[14px] font-extrabold text-text-primary tracking-tight whitespace-nowrap">
                          {colEmoji} {colLabel}
                        </h3>
                      </div>
                      
                      <div className="text-[11px] font-semibold text-text-graphite whitespace-nowrap shrink-0">
                        <span className="text-[12.5px] font-bold text-text-primary">{totalActiveInLane}</span> Tasks
                        <span className="opacity-40 text-[10px] font-medium ml-1">
                          ({totalCount > 0 ? Math.round((totalActiveInLane / totalCount) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    {/* Lane progress bar */}
                    <div className="w-full h-1 bg-hairline/40 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          col === 'todo' ? 'bg-zinc-400' :
                          col === 'in-progress' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${totalCount > 0 ? Math.round((totalActiveInLane / totalCount) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Task cards scroll container */}
                  <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 pr-0.5 scroller scrollbar-thin">
                    {colTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-14 text-text-graphite text-[12.5px] text-center border-2 border-dashed border-hairline/25 rounded-2xl bg-card/20 cursor-default">
                        <FolderX className="w-5.5 h-5.5 mb-2 opacity-60" />
                        <span>No lane tasks found.</span>
                        {activeChipsCount > 0 && (
                          <button 
                            onClick={handleClearFilters}
                            className="mt-3 px-3 py-1.5 rounded-full bg-blue-accent text-white text-[11px] font-bold hover:bg-blue-600 transition-colors"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const assignee = employees.find((e) => e.id === task.assigneeId);
                        const isOverdue = task.dueDate && isPastDate(task.dueDate) && task.status !== 'done';
                        const isSelected = selectedTaskIds.includes(task.id);
                        
                        return (
                          <DraggableCard 
                            key={task.id} 
                            id={task.id}
                            className={`bg-card rounded-[12px] border transition-all duration-200 flex flex-col group ${
                              isSelected
                                ? 'ring-2 ring-blue-accent border-blue-accent/30 shadow-md'
                                : 'border-hairline hover:border-blue-accent/25 shadow-sm hover:shadow-md hover:-translate-y-px'
                            }`}
                          >
                            {/* === TOP ROW: Priority + Menu === */}
                            <div className="flex items-center justify-between gap-2 px-3.5 pt-3.5 pb-0">
                              <div className="flex items-center gap-2">
                                {/* Checkbox (visible on hover/selected) */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => handleToggleSelectCard(task.id, e)}
                                    className="w-3.5 h-3.5 rounded border-hairline text-blue-accent cursor-pointer"
                                  />
                                </div>
                                <PriorityBadge value={task.priority} />
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Drag grip */}
                                <GripVertical className="w-3.5 h-3.5 text-text-graphite/30 group-hover:text-text-graphite/60 transition-colors hidden md:block cursor-grab" />
                                {/* ⋮ Menu */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-text-graphite hover:text-text-primary p-1 rounded hover:bg-fog transition-all cursor-pointer"
                                    title="Card actions"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                  {activeMenuTaskId === task.id && (
                                    <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-hairline rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingTask(task);
                                          setIsEditModalOpen(true);
                                          setActiveMenuTaskId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-[11.5px] font-semibold text-text-primary hover:bg-fog transition-colors flex items-center gap-2"
                                      >
                                        <Edit className="w-3 h-3 text-blue-500" />
                                        Edit
                                      </button>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingTask(task);
                                          setIsEditModalOpen(true);
                                          setActiveMenuTaskId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-[11.5px] font-semibold text-text-primary hover:bg-fog transition-colors flex items-center gap-2"
                                      >
                                        <div className="w-3 h-3 flex items-center justify-center text-[10px] text-indigo-500">👤</div>
                                        Assign
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (duplicateTask) duplicateTask(task.id);
                                          triggerToast('Duplicated task', 'success');
                                          setActiveMenuTaskId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-[11.5px] font-semibold text-text-primary hover:bg-fog transition-colors flex items-center gap-2"
                                      >
                                        <Copy className="w-3 h-3 text-emerald-500" />
                                        Duplicate
                                      </button>

                                      {task.status !== 'done' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateTaskStatus(task.id, 'done');
                                            triggerToast('Marked task completed', 'success');
                                            setActiveMenuTaskId(null);
                                          }}
                                          className="w-full text-left px-3 py-2 text-[11.5px] font-semibold text-text-primary hover:bg-fog transition-colors flex items-center gap-2"
                                        >
                                          <Check className="w-3 h-3 text-green-500" />
                                          Complete
                                        </button>
                                      )}

                                      <div className="border-t border-hairline/30 mt-1 pt-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTask(task.id);
                                            triggerToast('Deleted task', 'success');
                                            setActiveMenuTaskId(null);
                                          }}
                                          className="w-full text-left px-3 py-2 text-[11.5px] font-semibold text-red-600 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* === MIDDLE: Title + Description === */}
                            <div className="px-3.5 pt-2.5 pb-2.5 flex flex-col gap-1">
                              <h4 className="text-[13px] font-semibold text-text-primary leading-snug line-clamp-2">
                                {highlightSearchMatches(task.title, search)}
                              </h4>
                              <p className="text-[11.5px] text-text-graphite/80 leading-relaxed line-clamp-2">
                                {task.description}
                              </p>
                            </div>

                            {/* === BOTTOM ROW: Assignee + Dept + Due + Updated === */}
                            <div className="px-3.5 pt-2.5 pb-3 border-t border-hairline/15 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                              {/* Avatar + Name */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {assignee ? (
                                  <img
                                    src={assignee.avatarUrl}
                                    alt=""
                                    className="w-5 h-5 rounded-full object-cover border border-hairline/25"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${assignee.name}`;
                                    }}
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-fog border border-hairline/30 shrink-0" />
                                )}
                                <span className="text-[11px] font-semibold text-text-primary whitespace-nowrap">
                                  {assignee ? assignee.name.split(' ')[0] : 'Unassigned'}
                                </span>
                              </div>

                              {/* Dept badge */}
                              <DeptBadge dept={assignee?.department} />

                              {/* Spacer pushes date/time to right */}
                              <div className="flex-1" />

                              {/* Due date badge */}
                              <div className="flex flex-col items-end gap-1">
                                <DueDateIndicator dueDate={task.dueDate} status={task.status} />
                                <span className="text-[9px] font-medium text-text-graphite/50 whitespace-nowrap">
                                  {getTimeAgo(task.createdAt)}
                                </span>
                              </div>
                            </div>
                          </DraggableCard>
                        );
                      })
                    )}
                  </div>
                </DroppableColumn>
              );
            })}
          </div>
        </DndContext>
      ) : (
        /* Flat List Table View */
        <Card className="overflow-hidden p-0 border border-hairline mt-6 animate-in fade-in duration-300">
          <div className="overflow-x-auto scroller scrollbar-thin">
            <table className="w-full text-left border-collapse text-[13px] relative">
              <thead className="sticky top-0 z-10">
                <tr className="bg-fog border-b border-hairline text-text-graphite font-bold cursor-default">
                  <th className="px-5 py-3.5 w-12 text-center">
                    <input 
                      type="checkbox"
                      checked={selectedTaskIds.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTaskIds(filteredAndSortedTasks.map(t => t.id));
                        } else {
                          setSelectedTaskIds([]);
                        }
                      }}
                      className="w-3.5 h-3.5 rounded border-hairline text-blue-accent cursor-pointer"
                    />
                  </th>
                  <th className="px-5 py-3.5">Task Info</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assignee</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/40">
                {filteredAndSortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-text-graphite">
                      No matching tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedTasks.map((task) => {
                    const assignee = employees.find(e => e.id === task.assigneeId);
                    const isOverdue = task.dueDate && isPastDate(task.dueDate) && task.status !== 'done';
                    const isSelected = selectedTaskIds.includes(task.id);
                    
                    return (
                      <tr key={task.id} className={`hover:bg-fog/60 transition-colors ${isSelected ? 'bg-blue-500/5' : ''}`}>
                        <td className="px-5 py-4 text-center">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectCard(task.id, e)}
                            className="w-3.5 h-3.5 rounded border-hairline text-blue-accent cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-text-primary leading-tight line-clamp-1">
                              {highlightSearchMatches(task.title, search)}
                            </span>
                            <span className="text-[11px] text-text-graphite line-clamp-1">
                              {task.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <PriorityBadge value={task.priority} />
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                            task.status === 'done' ? 'bg-green-500/10 border-green-300 dark:border-green-900/50 text-green-800 dark:text-green-400' :
                            task.status === 'in-progress' ? 'bg-blue-500/10 border-blue-300 dark:border-blue-900/50 text-blue-800 dark:text-blue-400' :
                            'bg-zinc-100 border-zinc-300 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-400'
                          }`}>
                            {task.status === 'done' ? '✓ Done' : task.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {assignee && (
                              <img
                                src={assignee.avatarUrl}
                                alt={assignee.name}
                                className="w-5.5 h-5.5 rounded-full object-cover"
                              />
                            )}
                            <span className="font-semibold text-text-primary text-[12.5px]">
                              🙂 {assignee ? assignee.name : 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className={`px-5 py-4 font-semibold ${isOverdue ? 'text-red-600' : 'text-text-graphite'}`}>
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-hairline hover:bg-fog text-text-primary hover:text-blue-accent transition-colors cursor-pointer"
                              title="Edit task"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                deleteTask(task.id);
                                triggerToast('Task deleted successfully', 'success');
                              }}
                              className="p-1.5 rounded-lg border border-hairline hover:bg-red-500/10 text-red-600 transition-colors cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Bulk Actions Floating HUD */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-45 bg-card border border-hairline rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-6 min-w-[320px] max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-[12px] font-bold text-text-primary cursor-default">
            {selectedTaskIds.length} tasks selected
          </span>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (!e.target.value) return;
                bulkUpdateTasks(selectedTaskIds, { status: e.target.value as TaskStatus });
                triggerToast(`Updated status for ${selectedTaskIds.length} tasks`, 'success');
                setSelectedTaskIds([]);
              }}
              defaultValue=""
              className="bg-fog text-text-primary rounded-lg border border-hairline/50 px-2 py-1.5 text-[11px] font-semibold cursor-pointer"
            >
              <option value="" disabled>Status...</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            
            <select
              onChange={(e) => {
                if (!e.target.value) return;
                bulkUpdateTasks(selectedTaskIds, { priority: e.target.value as Priority });
                triggerToast(`Updated priority for ${selectedTaskIds.length} tasks`, 'success');
                setSelectedTaskIds([]);
              }}
              defaultValue=""
              className="bg-fog text-text-primary rounded-lg border border-hairline/50 px-2 py-1.5 text-[11px] font-semibold cursor-pointer"
            >
              <option value="" disabled>Priority...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button
              onClick={() => {
                bulkDeleteTasks(selectedTaskIds);
                triggerToast(`Deleted ${selectedTaskIds.length} tasks`, 'success');
                setSelectedTaskIds([]);
              }}
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2.5 py-1.5 text-[11px] font-bold cursor-pointer transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-[11px] text-text-graphite font-semibold hover:underline px-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Task modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
          <Input
            label="Task Title"
            value={newTask.title}
            onChange={(e) => {
              setNewTask({ ...newTask, title: e.target.value });
              if (validationErrors.title) setValidationErrors({ ...validationErrors, title: '' });
            }}
            placeholder="e.g. Migrate Postgres configurations"
            error={validationErrors.title}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700 dark:text-text-graphite">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => {
                setNewTask({ ...newTask, description: e.target.value });
                if (validationErrors.description) setValidationErrors({ ...validationErrors, description: '' });
              }}
              placeholder="Provide a detailed description of the tasks metrics or goals..."
              className={`w-full bg-white dark:bg-card rounded-[12px] border border-gray-300 dark:border-hairline px-4 py-2.5 text-[14px] min-h-[80px] placeholder-gray-400 dark:placeholder-text-graphite/60 text-gray-900 dark:text-text-primary focus:outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-500/15 transition-all resize-none ${
                validationErrors.description ? 'border-rust-light dark:border-rust border-2' : ''
              }`}
              required
            />
            {validationErrors.description && (
              <span className="text-[12px] text-rust font-medium">{validationErrors.description}</span>
            )}
          </div>

          <Select
            label="Assignee"
            options={[
              { value: '', label: 'Select Team Member' },
              ...employees.map((e) => ({ value: e.id, label: `${e.name} (${e.department})` }))
            ]}
            value={newTask.assigneeId}
            onChange={(e) => {
              setNewTask({ ...newTask, assigneeId: e.target.value });
              if (validationErrors.assigneeId) setValidationErrors({ ...validationErrors, assigneeId: '' });
            }}
            error={validationErrors.assigneeId}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
            />

            <Input
              label="Due Date"
              type="date"
              value={newTask.dueDate}
              onChange={(e) => {
                setNewTask({ ...newTask, dueDate: e.target.value });
                if (validationErrors.dueDate) setValidationErrors({ ...validationErrors, dueDate: '' });
              }}
              error={validationErrors.dueDate}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-4 mt-6 border-t border-hairline/25 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="text-[14px] text-text-graphite hover:text-rust underline underline-offset-4 decoration-1 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Existing Task">
        {editingTask && (
          <form onSubmit={handleEditTask} className="flex flex-col gap-4">
            <Input
              label="Task Title"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 dark:text-text-graphite">Description</label>
              <textarea
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                className="w-full bg-white dark:bg-card rounded-[12px] border border-gray-300 dark:border-hairline px-4 py-2.5 text-[14px] min-h-[80px] text-gray-900 dark:text-text-primary focus:outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-500/15 transition-all resize-none"
                required
              />
            </div>

            <Select
              label="Assignee"
              options={[
                { value: '', label: 'Select Team Member' },
                ...employees.map((e) => ({ value: e.id, label: `${e.name} (${e.department})` }))
              ]}
              value={editingTask.assigneeId}
              onChange={(e) => setEditingTask({ ...editingTask, assigneeId: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' }
                ]}
                value={editingTask.priority}
                onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
              />

              <Input
                label="Due Date"
                type="date"
                value={editingTask.dueDate ? editingTask.dueDate.substring(0, 10) : ''}
                onChange={(e) => setEditingTask({ ...editingTask, dueDate: new Date(e.target.value).toISOString() })}
                required
              />
            </div>

            <Select
              label="Status"
              options={[
                { value: 'todo', label: 'Todo' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'done', label: 'Done' }
              ]}
              value={editingTask.status === 'overdue' ? 'todo' : editingTask.status}
              onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
              required
            />

            <div className="flex items-center justify-end gap-4 mt-6 border-t border-hairline/25 pt-4">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="text-[14px] text-text-graphite hover:text-rust underline underline-offset-4 decoration-1 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-graphite font-semibold">Loading workspace...</div>}>
      <TasksPageInner />
    </Suspense>
  );
}
