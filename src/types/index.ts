export type Status = 'active' | 'inactive' | 'on-leave';
export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'overdue';

export interface Employee {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  department: string;
  status: Status;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;   // -> Employee.id
  priority: Priority;
  status: TaskStatus;
  dueDate: string;       // ISO date
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'task_created' | 'task_completed' | 'employee_added' | 'status_changed';
  message: string;
  timestamp: string;     // ISO date
}
