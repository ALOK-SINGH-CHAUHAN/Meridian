"use client";

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Employee, Task, TaskStatus, ActivityEvent } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_TASKS, INITIAL_EVENTS } from '../data/mockData';

interface AppState {
  employees: Employee[];
  tasks: Task[];
  events: ActivityEvent[];
}

type AppAction =
  | { type: 'REHYDRATE'; payload: AppState }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: TaskStatus } }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'LOG_ACTIVITY'; payload: ActivityEvent }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'BULK_DELETE_TASKS'; payload: string[] }
  | { type: 'BULK_UPDATE_TASKS'; payload: { taskIds: string[]; updates: Partial<Omit<Task, 'id' | 'createdAt'>> } }
  | { type: 'DUPLICATE_TASK'; payload: string };

const initialState: AppState = {
  employees: INITIAL_EMPLOYEES,
  tasks: INITIAL_TASKS,
  events: INITIAL_EVENTS,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'REHYDRATE':
      return action.payload;
    case 'ADD_TASK': {
      const updatedTasks = [action.payload, ...state.tasks];
      const assigneeName = state.employees.find(e => e.id === action.payload.assigneeId)?.name || 'Someone';
      const newEvent: ActivityEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'task_created',
        message: `${assigneeName} was assigned task "${action.payload.title}"`,
        timestamp: new Date().toISOString(),
      };
      const updatedEvents = [newEvent, ...state.events];
      const newState = {
        ...state,
        tasks: updatedTasks,
        events: updatedEvents,
      };
      try {
        localStorage.setItem('meridian_data', JSON.stringify(newState));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      return newState;
    }
    case 'UPDATE_TASK_STATUS': {
      const taskIndex = state.tasks.findIndex(t => t.id === action.payload.taskId);
      if (taskIndex === -1) return state;
      
      const task = state.tasks[taskIndex];
      const oldStatus = task.status;
      const newStatus = action.payload.status;
      
      if (oldStatus === newStatus) return state;
      
      const updatedTask = { ...task, status: newStatus };
      const updatedTasks = [...state.tasks];
      updatedTasks[taskIndex] = updatedTask;
      
      const assigneeName = state.employees.find(e => e.id === task.assigneeId)?.name || 'Someone';
      const eventType = newStatus === 'done' ? 'task_completed' : 'status_changed';
      let message = '';
      if (newStatus === 'done') {
        message = `${assigneeName} completed task "${task.title}"`;
      } else {
        message = `Task "${task.title}" status updated to ${newStatus.replace('-', ' ')}`;
      }
      
      const newEvent: ActivityEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: eventType,
        message,
        timestamp: new Date().toISOString(),
      };
      
      const updatedEvents = [newEvent, ...state.events];
      const newState = {
        ...state,
        tasks: updatedTasks,
        events: updatedEvents,
      };
      try {
        localStorage.setItem('meridian_data', JSON.stringify(newState));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      return newState;
    }
    case 'ADD_EMPLOYEE': {
      const updatedEmployees = [...state.employees, action.payload];
      const newEvent: ActivityEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'employee_added',
        message: `${action.payload.name} was added to ${action.payload.department} department as ${action.payload.role}`,
        timestamp: new Date().toISOString(),
      };
      const updatedEvents = [newEvent, ...state.events];
      const newState = {
        ...state,
        employees: updatedEmployees,
        events: updatedEvents,
      };
      try {
        localStorage.setItem('meridian_data', JSON.stringify(newState));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      return newState;
    }
    case 'LOG_ACTIVITY': {
      const updatedEvents = [action.payload, ...state.events];
      const newState = {
        ...state,
        events: updatedEvents,
      };
      try {
        localStorage.setItem('meridian_data', JSON.stringify(newState));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      return newState;
    }
    case 'DELETE_TASK': {
      const updatedTasks = state.tasks.filter(t => t.id !== action.payload);
      const newState = { ...state, tasks: updatedTasks };
      try {
        localStorage.setItem('meridian_data', JSON.stringify(newState));
      } catch (e) {}
      return newState;
    }
    case 'UPDATE_TASK': {
      const taskIndex = state.tasks.findIndex(t => t.id === action.payload.id);
      if (taskIndex === -1) return state;
      const updatedTasks = [...state.tasks];
      updatedTasks[taskIndex] = action.payload;
      const newState = { ...state, tasks: updatedTasks };
      try {
        localStorage.setItem('meridian_data', JSON.stringify(newState));
      } catch (e) {}
      return newState;
    }
    case 'BULK_DELETE_TASKS': {
      const updatedTasks = state.tasks.filter(t => !action.payload.includes(t.id));
      const newState = { ...state, tasks: updatedTasks };
      try {
        localStorage.setItem('meridian_data', JSON.stringify(newState));
      } catch (e) {}
      return newState;
    }
    case 'BULK_UPDATE_TASKS': {
      const updatedTasks = state.tasks.map(t => {
        if (action.payload.taskIds.includes(t.id)) {
          return { ...t, ...action.payload.updates };
        }
        return t;
      });
      const newState = { ...state, tasks: updatedTasks };
      try {
        localStorage.setItem('meridian_data', JSON.stringify(newState));
      } catch (e) {}
      return newState;
    }
    case 'DUPLICATE_TASK': {
      const taskToDuplicate = state.tasks.find(t => t.id === action.payload);
      if (!taskToDuplicate) return state;
      
      const duplicatedTask: Task = {
        ...taskToDuplicate,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: `${taskToDuplicate.title} (Copy)`,
        createdAt: new Date().toISOString(),
      };
      
      const updatedTasks = [duplicatedTask, ...state.tasks];
      const newState = { ...state, tasks: updatedTasks };
      try {
        localStorage.setItem('meridian_data', JSON.stringify(newState));
      } catch (e) {}
      return newState;
    }
    default:
      return state;
  }
}

interface AppDataContextType extends AppState {
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  logActivity: (type: ActivityEvent['type'], message: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (task: Task) => void;
  bulkDeleteTasks: (taskIds: string[]) => void;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  duplicateTask: (taskId: string) => void;
  
  // Shared global filter states
  searchFilter: string;
  setSearchFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  deptFilter: string;
  setDeptFilter: (val: string) => void;
  timeRangeFilter: string;
  setTimeRangeFilter: (val: string) => void;
  density: 'standard' | 'compact';
  setDensity: (val: 'standard' | 'compact') => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Global filters
  const [searchFilter, setSearchFilter] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [deptFilter, setDeptFilter] = React.useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = React.useState('14days');
  const [density, setDensity] = React.useState<'standard' | 'compact'>('standard');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('meridian_data');
      if (stored) {
        dispatch({ type: 'REHYDRATE', payload: JSON.parse(stored) });
      }
    } catch (e) {
      console.warn("Could not rehydrate state:", e);
    }
  }, []);

  // Load global filters from localStorage on mount (prevents SSR mismatch)
  useEffect(() => {
    try {
      const savedSearch = localStorage.getItem('meridian_searchFilter');
      const savedPriority = localStorage.getItem('meridian_priorityFilter');
      const savedStatus = localStorage.getItem('meridian_statusFilter');
      const savedDept = localStorage.getItem('meridian_deptFilter');
      const savedTime = localStorage.getItem('meridian_timeRangeFilter');
      const savedDensity = localStorage.getItem('meridian_density');
      
      if (savedSearch) setSearchFilter(savedSearch);
      if (savedPriority) setPriorityFilter(savedPriority);
      if (savedStatus) setStatusFilter(savedStatus);
      if (savedDept) setDeptFilter(savedDept);
      if (savedTime) setTimeRangeFilter(savedTime);
      if (savedDensity === 'compact' || savedDensity === 'standard') setDensity(savedDensity);
    } catch (e) {
      console.warn("Could not load filters from storage:", e);
    }
  }, []);

  // Persist global filters to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('meridian_searchFilter', searchFilter);
    } catch (e) {}
  }, [searchFilter]);

  useEffect(() => {
    try {
      localStorage.setItem('meridian_priorityFilter', priorityFilter);
    } catch (e) {}
  }, [priorityFilter]);

  useEffect(() => {
    try {
      localStorage.setItem('meridian_statusFilter', statusFilter);
    } catch (e) {}
  }, [statusFilter]);

  useEffect(() => {
    try {
      localStorage.setItem('meridian_deptFilter', deptFilter);
    } catch (e) {}
  }, [deptFilter]);

  useEffect(() => {
    try {
      localStorage.setItem('meridian_timeRangeFilter', timeRangeFilter);
    } catch (e) {}
  }, [timeRangeFilter]);

  useEffect(() => {
    try {
      localStorage.setItem('meridian_density', density);
    } catch (e) {}
  }, [density]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status } });
  };

  const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: `emp-${Date.now()}`,
    };
    dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
  };

  const logActivity = (type: ActivityEvent['type'], message: string) => {
    const newEvent: ActivityEvent = {
      id: `evt-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'LOG_ACTIVITY', payload: newEvent });
  };

  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const bulkDeleteTasks = (taskIds: string[]) => {
    dispatch({ type: 'BULK_DELETE_TASKS', payload: taskIds });
  };

  const bulkUpdateTasks = (taskIds: string[], updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    dispatch({ type: 'BULK_UPDATE_TASKS', payload: { taskIds, updates } });
  };

  const duplicateTask = (taskId: string) => {
    dispatch({ type: 'DUPLICATE_TASK', payload: taskId });
  };

  return (
    <AppDataContext.Provider
      value={{
        ...state,
        addTask,
        updateTaskStatus,
        addEmployee,
        logActivity,
        deleteTask,
        updateTask,
        bulkDeleteTasks,
        bulkUpdateTasks,
        duplicateTask,
        
        searchFilter,
        setSearchFilter,
        priorityFilter,
        setPriorityFilter,
        statusFilter,
        setStatusFilter,
        deptFilter,
        setDeptFilter,
        timeRangeFilter,
        setTimeRangeFilter,
        density,
        setDensity,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
