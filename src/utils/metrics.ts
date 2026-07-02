import { Task, Employee } from '../types';
import { isPastDate } from './dateHelpers';

export interface DashboardMetrics {
  totalEmployees: number;
  activeTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export function calculateMetrics(tasks: Task[], employees: Employee[]): DashboardMetrics {
  const totalEmployees = employees.length;
  
  // Active Tasks: Todo + In Progress (including overdue status which displays in Todo column)
  const activeTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in-progress' || t.status === 'overdue').length;
  
  // Overdue Tasks: due date before today and status is not done
  const overdueTasks = tasks.filter(t => t.status !== 'done' && isPastDate(t.dueDate)).length;
  
  // Completion Rate: (Done / Total) * 100
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  return {
    totalEmployees,
    activeTasks,
    overdueTasks,
    completionRate
  };
}
