import { Employee, Task, ActivityEvent } from '../types';

// Helpers for relative date generation
export function relativeDate(daysAgo: number, hoursAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

export function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString();
}

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Alexander Wright', role: 'Principal Architect', department: 'Engineering', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-2', name: 'Sophia Chen', role: 'Staff Product PM', department: 'Product', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-3', name: 'Marcus Vance', role: 'Senior UX Designer', department: 'Design', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-4', name: 'Elena Rostova', role: 'Lead Frontend Dev', department: 'Engineering', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-5', name: 'Devon Carter', role: 'Security Specialist', department: 'Security', status: 'on-leave', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-6', name: 'Meera Patel', role: 'Data Scientist', department: 'Analytics', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-7', name: 'Liam O\'Connor', role: 'DevOps Engineer', department: 'Engineering', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-8', name: 'Yuki Tanaka', role: 'QA Lead', department: 'Engineering', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-9', name: 'Gabriel Barbosa', role: 'iOS Engineer', department: 'Engineering', status: 'inactive', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-10', name: 'Chloe Dubois', role: 'HR Specialist', department: 'Operations', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-11', name: 'Daniel Kim', role: 'Backend Developer', department: 'Engineering', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-12', name: 'Aisha Barrow', role: 'Marketing Manager', department: 'Marketing', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-13', name: 'Nathan Drake', role: 'Penetration Tester', department: 'Security', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-14', name: 'Isabella Rossi', role: 'UI Illustrator', department: 'Design', status: 'on-leave', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-15', name: 'Tariq Mahmoud', department: 'Engineering', role: 'Full Stack Dev', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-16', name: 'Clara Oswald', role: 'Associate PM', department: 'Product', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1557555187-23d685287bc3?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-17', name: 'Oliver Twist', role: 'Office Coordinator', department: 'Operations', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-18', name: 'Lucas Meyer', role: 'Systems Engineer', department: 'Engineering', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-19', name: 'Nina Williams', role: 'Security Analyst', department: 'Security', status: 'inactive', avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-20', name: 'Ken Masters', role: 'SEO Specialist', department: 'Marketing', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-21', name: 'Ryu Hoshi', role: 'Database Admin', department: 'Engineering', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-22', name: 'Chun Li', role: 'Operations Director', department: 'Operations', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-23', name: 'Sarah Connor', role: 'Threat Officer', department: 'Security', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-24', name: 'John Connor', role: 'Junior Web Dev', department: 'Engineering', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-25', name: 'Ellen Ripley', role: 'Risk Auditor', department: 'Security', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-26', name: 'Peter Parker', role: 'Graphic Designer', department: 'Design', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-27', name: 'Bruce Wayne', role: 'Facilities Lead', department: 'Operations', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-28', name: 'Diana Prince', role: 'Portfolio Manager', department: 'Product', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-29', name: 'Clark Kent', role: 'Content Strategist', department: 'Marketing', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: 'emp-30', name: 'Tony Stark', role: 'Research Fellow', department: 'Engineering', status: 'active', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' }
];

export const INITIAL_TASKS: Task[] = [
  // Overdue tasks
  {
    id: 'task-1',
    title: 'Migrate legacy auth database',
    description: 'Relocate old table spaces to the new cloud cluster schemas and verify index bindings.',
    assigneeId: 'emp-1',
    priority: 'high',
    status: 'overdue',
    dueDate: relativeDate(4),
    createdAt: relativeDate(14)
  },
  {
    id: 'task-2',
    title: 'Fix CSRF vulnerabilities on gateway',
    description: 'Inspect gateway route headers and enforce strict cookies checking on state changes.',
    assigneeId: 'emp-5',
    priority: 'high',
    status: 'overdue',
    dueDate: relativeDate(2),
    createdAt: relativeDate(8)
  },
  {
    id: 'task-3',
    title: 'Finalize mobile layout redesign',
    description: 'Adapt the navigation drawer and user forms to support smaller mobile displays.',
    assigneeId: 'emp-3',
    priority: 'medium',
    status: 'overdue',
    dueDate: relativeDate(1),
    createdAt: relativeDate(10)
  },
  {
    id: 'task-4',
    title: 'Update privacy compliance policy',
    description: 'Revise terms and document data processing audits for the operations department.',
    assigneeId: 'emp-10',
    priority: 'low',
    status: 'overdue',
    dueDate: relativeDate(3),
    createdAt: relativeDate(7)
  },
  
  // Todo tasks
  {
    id: 'task-5',
    title: 'Setup Kubernetes staging configs',
    description: 'Review ingress templates and configure replica policies for backend microservices.',
    assigneeId: 'emp-7',
    priority: 'high',
    status: 'todo',
    dueDate: futureDate(5),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-6',
    title: 'Draft Product roadmap Q3',
    description: 'Collaborate with architecture and design leads to map product milestones.',
    assigneeId: 'emp-2',
    priority: 'medium',
    status: 'todo',
    dueDate: futureDate(12),
    createdAt: relativeDate(1)
  },
  {
    id: 'task-7',
    title: 'Implement debounce custom hook',
    description: 'Write debounce utility to optimize search queries on operational lists.',
    assigneeId: 'emp-4',
    priority: 'low',
    status: 'todo',
    dueDate: futureDate(4),
    createdAt: relativeDate(1)
  },
  {
    id: 'task-8',
    title: 'Review analytics API endpoints',
    description: 'Document response latency and schema layouts for query optimizations.',
    assigneeId: 'emp-6',
    priority: 'low',
    status: 'todo',
    dueDate: futureDate(9),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-9',
    title: 'Write unit tests for date helpers',
    description: 'Verify output strings for relative time calculation rules.',
    assigneeId: 'emp-8',
    priority: 'medium',
    status: 'todo',
    dueDate: futureDate(3),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-10',
    title: 'Update onboarding documentation',
    description: 'Rewrite setup guides for engineering recruits to include new repo steps.',
    assigneeId: 'emp-10',
    priority: 'low',
    status: 'todo',
    dueDate: futureDate(14),
    createdAt: relativeDate(4)
  },
  {
    id: 'task-11',
    title: 'Refactor select component styling',
    description: 'Apply input border radii tokens to select layouts in theme mode.',
    assigneeId: 'emp-14',
    priority: 'medium',
    status: 'todo',
    dueDate: futureDate(6),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-12',
    title: 'Audit marketing email templates',
    description: 'Inspect visual style guidelines across email clients for alignment.',
    assigneeId: 'emp-12',
    priority: 'low',
    status: 'todo',
    dueDate: futureDate(15),
    createdAt: relativeDate(5)
  },
  {
    id: 'task-13',
    title: 'Configure Sentry error boundaries',
    description: 'Integrate reporting scripts with front-end React contexts.',
    assigneeId: 'emp-15',
    priority: 'high',
    status: 'todo',
    dueDate: futureDate(7),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-14',
    title: 'Optimize PNG image assets',
    description: 'Compress layout files to improve contentful rendering load times.',
    assigneeId: 'emp-26',
    priority: 'low',
    status: 'todo',
    dueDate: futureDate(11),
    createdAt: relativeDate(4)
  },
  {
    id: 'task-15',
    title: 'Review office layout ergonomics',
    description: 'Map department desk partitions according to noise budgets.',
    assigneeId: 'emp-27',
    priority: 'low',
    status: 'todo',
    dueDate: futureDate(20),
    createdAt: relativeDate(6)
  },
  {
    id: 'task-16',
    title: 'Analyze competitor feature releases',
    description: 'Synthesize operations matrices to update product boards.',
    assigneeId: 'emp-28',
    priority: 'medium',
    status: 'todo',
    dueDate: futureDate(10),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-17',
    title: 'Refactor search bar layout',
    description: 'Combine input and filter elements to save dashboard vertical space.',
    assigneeId: 'emp-4',
    priority: 'medium',
    status: 'todo',
    dueDate: futureDate(4),
    createdAt: relativeDate(1)
  },
  {
    id: 'task-18',
    title: 'Write script to seed database',
    description: 'Create faker generation procedures for testing analytics tables.',
    assigneeId: 'emp-21',
    priority: 'low',
    status: 'todo',
    dueDate: futureDate(8),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-19',
    title: 'Perform backup restoration test',
    description: 'Validate database backup compression integrity on offline disks.',
    assigneeId: 'emp-18',
    priority: 'high',
    status: 'todo',
    dueDate: futureDate(2),
    createdAt: relativeDate(1)
  },

  // In-progress tasks
  {
    id: 'task-20',
    title: 'Implement Dark mode theme persistence',
    description: 'Create localStorage binding state and prevent dark mode flashing.',
    assigneeId: 'emp-4',
    priority: 'high',
    status: 'in-progress',
    dueDate: futureDate(2),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-21',
    title: 'Design system settings panels',
    description: 'Style form cards and theme toggle component states.',
    assigneeId: 'emp-3',
    priority: 'medium',
    status: 'in-progress',
    dueDate: futureDate(5),
    createdAt: relativeDate(4)
  },
  {
    id: 'task-22',
    title: 'Build analytics dashboard charts',
    description: 'Wired Recharts line graphs to active completion metrics contexts.',
    assigneeId: 'emp-6',
    priority: 'high',
    status: 'in-progress',
    dueDate: futureDate(3),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-23',
    title: 'Setup automated linting workflows',
    description: 'Configure lint checks inside git pre-commit script hooks.',
    assigneeId: 'emp-8',
    priority: 'low',
    status: 'in-progress',
    dueDate: futureDate(6),
    createdAt: relativeDate(5)
  },
  {
    id: 'task-24',
    title: 'Write API endpoint tests',
    description: 'Verify status code outputs for CRUD operations in tasks controller.',
    assigneeId: 'emp-11',
    priority: 'medium',
    status: 'in-progress',
    dueDate: futureDate(4),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-25',
    title: 'Draft content for Q3 newsletters',
    description: 'Develop marketing pitches for enterprise operations releases.',
    assigneeId: 'emp-29',
    priority: 'low',
    status: 'in-progress',
    dueDate: futureDate(8),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-26',
    title: 'Configure OAuth gateway scopes',
    description: 'Enforce scope bindings for operations directories logins.',
    assigneeId: 'emp-13',
    priority: 'high',
    status: 'in-progress',
    dueDate: futureDate(3),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-27',
    title: 'Research container queries fallbacks',
    description: 'Test CSS container query sizing across modern browser engines.',
    assigneeId: 'emp-15',
    priority: 'low',
    status: 'in-progress',
    dueDate: futureDate(7),
    createdAt: relativeDate(4)
  },
  {
    id: 'task-28',
    title: 'Style modals dialog overlays',
    description: 'Enforce dialog backdrop opacity and accessibility keyboard traps.',
    assigneeId: 'emp-3',
    priority: 'medium',
    status: 'in-progress',
    dueDate: futureDate(1),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-29',
    title: 'Optimize React render trees',
    description: 'Analyze component tree render counts in profiling dashboards.',
    assigneeId: 'emp-30',
    priority: 'high',
    status: 'in-progress',
    dueDate: futureDate(3),
    createdAt: relativeDate(4)
  },
  {
    id: 'task-30',
    title: 'Audit system firewall logs',
    description: 'Check inbound traffic logs for unauthorized API access attempts.',
    assigneeId: 'emp-23',
    priority: 'high',
    status: 'in-progress',
    dueDate: futureDate(1),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-31',
    title: 'Implement employees filter dropdowns',
    description: 'Construct responsive select menus for department sorting.',
    assigneeId: 'emp-2',
    priority: 'medium',
    status: 'in-progress',
    dueDate: futureDate(4),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-32',
    title: 'Test cross-device layouts',
    description: 'Manually inspect layout responsive wrappers in simulated viewports.',
    assigneeId: 'emp-16',
    priority: 'low',
    status: 'in-progress',
    dueDate: futureDate(5),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-33',
    title: 'Secure API cookie structures',
    description: 'Enforce SameSite settings for security sessions tokens.',
    assigneeId: 'emp-25',
    priority: 'high',
    status: 'in-progress',
    dueDate: futureDate(3),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-34',
    title: 'Conduct weekly status alignment',
    description: 'Lead operational status sync across engineering and product managers.',
    assigneeId: 'emp-22',
    priority: 'low',
    status: 'in-progress',
    dueDate: futureDate(2),
    createdAt: relativeDate(1)
  },

  // Completed tasks (distributed over last 14 days to show trend)
  {
    id: 'task-35',
    title: 'Configure Webpack loaders',
    description: 'Setup CSS loaders for legacy code components integrations.',
    assigneeId: 'emp-1',
    priority: 'medium',
    status: 'done',
    dueDate: relativeDate(1),
    createdAt: relativeDate(14)
  },
  {
    id: 'task-36',
    title: 'Implement CSS variables theme',
    description: 'Bind color scheme properties to tailwind styling variables.',
    assigneeId: 'emp-4',
    priority: 'high',
    status: 'done',
    dueDate: relativeDate(2),
    createdAt: relativeDate(13)
  },
  {
    id: 'task-37',
    title: 'Fix navigation header jump',
    description: 'Set layout container heights to resolve layout shifts.',
    assigneeId: 'emp-3',
    priority: 'low',
    status: 'done',
    dueDate: relativeDate(3),
    createdAt: relativeDate(12)
  },
  {
    id: 'task-38',
    title: 'Setup PostgreSQL clusters',
    description: 'Build failover instances for analytics storage environments.',
    assigneeId: 'emp-18',
    priority: 'high',
    status: 'done',
    dueDate: relativeDate(4),
    createdAt: relativeDate(11)
  },
  {
    id: 'task-39',
    title: 'Establish threat models matrices',
    description: 'Map application ingress pathways to threat vectors lists.',
    assigneeId: 'emp-5',
    priority: 'high',
    status: 'done',
    dueDate: relativeDate(5),
    createdAt: relativeDate(10)
  },
  {
    id: 'task-40',
    title: 'Redesign settings toggle thumb',
    description: 'Create 9999px layout pill slider in neutral grays.',
    assigneeId: 'emp-3',
    priority: 'low',
    status: 'done',
    dueDate: relativeDate(6),
    createdAt: relativeDate(9)
  },
  {
    id: 'task-41',
    title: 'Conduct QA regression pass',
    description: 'Perform standard checkout pipeline validation test scripts.',
    assigneeId: 'emp-8',
    priority: 'medium',
    status: 'done',
    dueDate: relativeDate(7),
    createdAt: relativeDate(8)
  },
  {
    id: 'task-42',
    title: 'Analyze memory profiling data',
    description: 'Resolve React state retain cycles in virtualized tables.',
    assigneeId: 'emp-30',
    priority: 'high',
    status: 'done',
    dueDate: relativeDate(8),
    createdAt: relativeDate(7)
  },
  {
    id: 'task-43',
    title: 'Build employee grid layout',
    description: 'Construct responsive grids of cards with status tags.',
    assigneeId: 'emp-4',
    priority: 'medium',
    status: 'done',
    dueDate: relativeDate(9),
    createdAt: relativeDate(6)
  },
  {
    id: 'task-44',
    title: 'Configure WebAccess security keys',
    description: 'Wire hardware authenticator endpoints inside authentication routers.',
    assigneeId: 'emp-13',
    priority: 'high',
    status: 'done',
    dueDate: relativeDate(10),
    createdAt: relativeDate(5)
  },
  {
    id: 'task-45',
    title: 'Optimize API response parsing',
    description: 'Replace custom parsers with fast JSON string parse calls.',
    assigneeId: 'emp-11',
    priority: 'low',
    status: 'done',
    dueDate: relativeDate(11),
    createdAt: relativeDate(4)
  },
  {
    id: 'task-46',
    title: 'Draft press release copy',
    description: 'Outline operations platform rollout announcements.',
    assigneeId: 'emp-12',
    priority: 'low',
    status: 'done',
    dueDate: relativeDate(12),
    createdAt: relativeDate(3)
  },
  {
    id: 'task-47',
    title: 'Conduct accessibility contrast audits',
    description: 'Ensure color compliance ratios for primary text lines.',
    assigneeId: 'emp-3',
    priority: 'medium',
    status: 'done',
    dueDate: relativeDate(13),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-48',
    title: 'Resolve memory retain cycles',
    description: 'Clean listener references in web socket lifecycle triggers.',
    assigneeId: 'emp-1',
    priority: 'high',
    status: 'done',
    dueDate: relativeDate(13),
    createdAt: relativeDate(2)
  },
  {
    id: 'task-49',
    title: 'Audit Docker build dependencies',
    description: 'Delete unused base layers to reduce staging image sizes.',
    assigneeId: 'emp-7',
    priority: 'low',
    status: 'done',
    dueDate: relativeDate(14),
    createdAt: relativeDate(1)
  },
  {
    id: 'task-50',
    title: 'Initialize repository scaffold',
    description: 'Set typescript configs and folder architecture rules.',
    assigneeId: 'emp-4',
    priority: 'high',
    status: 'done',
    dueDate: relativeDate(14),
    createdAt: relativeDate(1)
  }
];

export const INITIAL_EVENTS: ActivityEvent[] = [
  {
    id: 'evt-1',
    type: 'task_created',
    message: 'Alexander Wright created task "Migrate legacy auth database"',
    timestamp: relativeDate(0, 2)
  },
  {
    id: 'evt-2',
    type: 'status_changed',
    message: 'Devon Carter changed status to "on-leave"',
    timestamp: relativeDate(0, 4)
  },
  {
    id: 'evt-3',
    type: 'task_completed',
    message: 'Elena Rostova completed task "Initialize repository scaffold"',
    timestamp: relativeDate(0, 7)
  },
  {
    id: 'evt-4',
    type: 'employee_added',
    message: 'Tony Stark was added to Engineering department',
    timestamp: relativeDate(1, 1)
  },
  {
    id: 'evt-5',
    type: 'task_created',
    message: 'Marcus Vance created task "Design system settings panels"',
    timestamp: relativeDate(1, 3)
  },
  {
    id: 'evt-6',
    type: 'task_completed',
    message: 'Alexander Wright completed task "Resolve memory retain cycles"',
    timestamp: relativeDate(1, 8)
  },
  {
    id: 'evt-7',
    type: 'status_changed',
    message: 'Isabella Rossi changed status to "on-leave"',
    timestamp: relativeDate(2, 2)
  },
  {
    id: 'evt-8',
    type: 'task_created',
    message: 'Sophia Chen created task "Draft Product roadmap Q3"',
    timestamp: relativeDate(2, 5)
  },
  {
    id: 'evt-9',
    type: 'task_completed',
    message: 'Marcus Vance completed task "Conduct accessibility contrast audits"',
    timestamp: relativeDate(2, 11)
  },
  {
    id: 'evt-10',
    type: 'employee_added',
    message: 'Clark Kent was added to Marketing department',
    timestamp: relativeDate(3, 2)
  },
  {
    id: 'evt-11',
    type: 'task_created',
    message: 'Devon Carter created task "Fix CSRF vulnerabilities on gateway"',
    timestamp: relativeDate(3, 6)
  },
  {
    id: 'evt-12',
    type: 'task_completed',
    message: 'Daniel Kim completed task "Optimize API response parsing"',
    timestamp: relativeDate(3, 9)
  },
  {
    id: 'evt-13',
    type: 'task_created',
    message: 'Meera Patel created task "Review analytics API endpoints"',
    timestamp: relativeDate(4, 1)
  },
  {
    id: 'evt-14',
    type: 'task_completed',
    message: 'Aisha Barrow completed task "Draft press release copy"',
    timestamp: relativeDate(4, 5)
  },
  {
    id: 'evt-15',
    type: 'status_changed',
    message: 'Gabriel Barbosa changed status to "inactive"',
    timestamp: relativeDate(5, 3)
  },
  {
    id: 'evt-16',
    type: 'task_created',
    message: 'Elena Rostova created task "Implement Dark mode theme persistence"',
    timestamp: relativeDate(5, 8)
  },
  {
    id: 'evt-17',
    type: 'task_completed',
    message: 'Nathan Drake completed task "Configure WebAccess security keys"',
    timestamp: relativeDate(5, 12)
  },
  {
    id: 'evt-18',
    type: 'employee_added',
    message: 'Diana Prince was added to Product department',
    timestamp: relativeDate(6, 4)
  },
  {
    id: 'evt-19',
    type: 'task_created',
    message: 'Liam O\'Connor created task "Setup Kubernetes staging configs"',
    timestamp: relativeDate(7, 2)
  },
  {
    id: 'evt-20',
    type: 'task_completed',
    message: 'Elena Rostova completed task "Build employee grid layout"',
    timestamp: relativeDate(7, 9)
  }
];
