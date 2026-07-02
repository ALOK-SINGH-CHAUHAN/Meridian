"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAppData } from '../context/AppDataContext';
import { calculateMetrics } from '../utils/metrics';
import { getRelativeTimeString, isPastDate } from '../utils/dateHelpers';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { 
  PlusCircle, 
  CheckCircle2, 
  UserPlus, 
  RefreshCw, 
  ArrowUpRight, 
  AlertCircle,
  TrendingUp,
  Download,
  Filter,
  Users,
  CheckCircle,
  Clock,
  Briefcase,
  Flame,
  Award,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function AnimatedNumber({ value }: { value: number }) {
  const displayValue = useAnimatedNumber(value);
  return <>{displayValue}</>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { 
    tasks, 
    employees, 
    events,
    priorityFilter,
    setPriorityFilter,
    deptFilter,
    setDeptFilter,
    timeRangeFilter,
    setTimeRangeFilter,
    searchFilter,
    statusFilter
  } = useAppData();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [activeAnalytics, setActiveAnalytics] = useState<'completions' | 'productivity'>('completions');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Interactive chart state
  const [hiddenDepts, setHiddenDepts] = useState<Record<string, boolean>>({});
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Shrunk fake loading skeleton duration to 500ms
    return () => clearTimeout(timer);
  }, []);

  // Filter tasks based on global context filters before calculations
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = !searchFilter || 
                            t.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
                            t.description.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'todo') {
          matchesStatus = t.status === 'todo' || t.status === 'overdue';
        } else {
          matchesStatus = t.status === statusFilter;
        }
      }

      const assignee = employees.find(e => e.id === t.assigneeId);
      const matchesDept = deptFilter === 'all' || (assignee && assignee.department === deptFilter);

      return matchesSearch && matchesPriority && matchesStatus && matchesDept;
    });
  }, [tasks, employees, searchFilter, priorityFilter, statusFilter, deptFilter]);

  // Calculate live metrics based on filtered list
  const metrics = useMemo(() => calculateMetrics(filteredTasks, employees), [filteredTasks, employees]);

  // Time range day count selection
  const numDays = timeRangeFilter === '7days' ? 7 : timeRangeFilter === '30days' ? 30 : 14;

  // Multi-line completions trend data by department
  const chartData = useMemo(() => {
    return Array.from({ length: numDays }).map((_, idx) => {
      const daysAgo = numDays - 1 - idx;
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      const dateLimit = new Date(d);
      dateLimit.setHours(23, 59, 59, 999);

      const getCompletionsByDeptCumulative = (deptName: string) => {
        return filteredTasks.filter(t => {
          if (t.status !== 'done') return false;
          const assignee = employees.find(e => e.id === t.assigneeId);
          if (!assignee || assignee.department !== deptName) return false;
          
          const taskDate = new Date(t.dueDate);
          return taskDate <= dateLimit;
        }).length;
      };

      // Productivity Score (cumulative completion rate up to this day)
      const tasksUpToDay = filteredTasks.filter(t => new Date(t.createdAt) <= dateLimit);
      const doneUpToDay = tasksUpToDay.filter(t => t.status === 'done').length;
      const rateUpToDay = tasksUpToDay.length > 0 ? Math.round((doneUpToDay / tasksUpToDay.length) * 100) : 0;

      return {
        name: dateLabel,
        Engineering: getCompletionsByDeptCumulative('Engineering'),
        Product: getCompletionsByDeptCumulative('Product'),
        Security: getCompletionsByDeptCumulative('Security'),
        Operations: getCompletionsByDeptCumulative('Operations'),
        Productivity: rateUpToDay === 0 ? 55 + idx * 2 : rateUpToDay
      };
    });
  }, [filteredTasks, employees, numDays]);

  // Mini-Sparkline data generator
  const getSparklineData = useCallback((metric: 'employees' | 'active' | 'overdue' | 'rate') => {
    return Array.from({ length: 8 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (7 - idx));
      const tasksUpToDay = filteredTasks.filter(t => new Date(t.createdAt) <= d);
      
      if (metric === 'employees') {
        const matchingEmps = deptFilter === 'all' 
          ? employees.length 
          : employees.filter(e => e.department === deptFilter).length;
        return { value: matchingEmps + (idx % 3 === 0 ? 1 : 0) };
      }
      if (metric === 'active') {
        const activeCount = tasksUpToDay.filter(t => t.status === 'todo' || t.status === 'in-progress' || t.status === 'overdue').length;
        return { value: activeCount };
      }
      if (metric === 'overdue') {
        const overdueCount = tasksUpToDay.filter(t => {
          if (!t.dueDate) return false;
          if (t.status === 'done') return false;
          const date = new Date(t.dueDate);
          const compareDay = new Date(d);
          compareDay.setHours(0, 0, 0, 0);
          date.setHours(0, 0, 0, 0);
          return date < compareDay;
        }).length;
        return { value: overdueCount };
      }
      // Rate
      const done = tasksUpToDay.filter(t => t.status === 'done').length;
      return { value: tasksUpToDay.length > 0 ? Math.round((done / tasksUpToDay.length) * 100) : 0 };
    });
  }, [filteredTasks, employees, deptFilter]);

  // Task Distribution Donut Data
  const donutData = useMemo(() => {
    const todoCount = filteredTasks.filter(t => t.status === 'todo' || t.status === 'overdue').length;
    const inProgressCount = filteredTasks.filter(t => t.status === 'in-progress').length;
    const doneCount = filteredTasks.filter(t => t.status === 'done').length;

    return [
      { name: 'Todo', value: todoCount, color: '#f87171' }, // light red
      { name: 'In Progress', value: inProgressCount, color: '#fb923c' }, // light orange
      { name: 'Done', value: doneCount, color: '#4ade80' } // light green
    ].filter(item => item.value > 0);
  }, [filteredTasks]);

  // Department Performance completion rate calculations
  const departmentsList = useMemo(() => ['Engineering', 'Product', 'Security', 'Operations'], []);
  const getDeptPerformance = useCallback((deptName: string) => {
    const deptTasks = tasks.filter(t => {
      const assignee = employees.find(e => e.id === t.assigneeId);
      return assignee && assignee.department === deptName;
    });
    const completed = deptTasks.filter(t => t.status === 'done').length;
    return deptTasks.length > 0 ? Math.round((completed / deptTasks.length) * 100) : 0;
  }, [tasks, employees]);

  // Weekday Heatmap Calculations
  const weekdays = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], []);
  const getWeekdayActivity = useCallback((dayIndex: number) => {
    return filteredTasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      let day = taskDate.getDay();
      if (day === 0) day = 1; // Sun -> Mon
      if (day === 6) day = 5; // Sat -> Fri
      return day === (dayIndex + 1);
    }).length;
  }, [filteredTasks]);

  const weekdayData = useMemo(() => weekdays.map((day, idx) => ({
    day,
    count: getWeekdayActivity(idx),
  })).sort((a, b) => b.count - a.count), [weekdays, getWeekdayActivity]);

  // Employee Leaderboard calculations
  const leaderboardData = useMemo(() => employees
    .map(emp => {
      const completedCount = tasks.filter(t => t.assigneeId === emp.id && t.status === 'done').length;
      return { name: emp.name, count: completedCount, avatar: emp.avatarUrl };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4), [employees, tasks]);

  // Upcoming Deadlines (within next 7 days, sorted by nearest)
  const upcomingDeadlines = useMemo(() => filteredTasks
    .filter(t => t.status !== 'done' && new Date(t.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3), [filteredTasks]);

  // Grouped Activity Logs (Today, Yesterday, Earlier)
  const groupedEvents = useMemo(() => {
    const now = new Date();
    const today: typeof events = [];
    const yesterday: typeof events = [];
    const earlier: typeof events = [];

    events.forEach(evt => {
      const evtDate = new Date(evt.timestamp);
      const diffMs = now.getTime() - evtDate.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);

      if (diffHrs < 24) {
        today.push(evt);
      } else if (diffHrs < 48) {
        yesterday.push(evt);
      } else {
        earlier.push(evt);
      }
    });

    return { today, yesterday, earlier };
  }, [events]);

  const handleExportJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredTasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `meridian_tasks_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  }, [filteredTasks]);

  const handleExportCSV = useCallback(() => {
    if (filteredTasks.length === 0) return;
    const headers = Object.keys(filteredTasks[0]).join(',');
    const rows = filteredTasks.map(t => Object.values(t).map(v => `"${v}"`).join(',')).join('\n');
    const csvStr = "data:text/csv;charset=utf-8," + encodeURIComponent(`${headers}\n${rows}`);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvStr);
    downloadAnchor.setAttribute("download", `meridian_tasks_export_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  }, [filteredTasks]);

  // Recent logs click handler -> search for task inside log
  const handleLogClick = useCallback((evt: typeof events[0]) => {
    const match = evt.message.match(/"([^"]+)"/);
    if (match && match[1]) {
      router.push(`/tasks?search=${encodeURIComponent(match[1])}`);
    } else {
      router.push(`/tasks`);
    }
  }, [router]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'employee_added':
        return <UserPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'status_changed':
        return <RefreshCw className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />;
    }
  };

  // Sparkline chart component for KPI cards
  const Sparkline = ({ metric }: { metric: 'employees' | 'active' | 'overdue' | 'rate' }) => {
    const data = getSparklineData(metric);
    const strokeColor = metric === 'employees' 
      ? '#2563eb' 
      : metric === 'active' 
      ? '#ea580c' 
      : metric === 'overdue' 
      ? '#dc2626' 
      : '#16a34a';

    return (
      <div className="w-[80px] h-[30px] opacity-85">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={strokeColor} 
              strokeWidth={1.5} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Skeletons
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mt-2" />
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mt-2" />
      </div>
    </Card>
  );

  const toggleDeptLine = (dept: string) => {
    setHiddenDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  if (loading || !mounted) {
    return (
      <PageWrapper>
        <div className="flex flex-col gap-1 mt-2">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24 animate-pulse" />
          <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded w-64 mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="h-[300px] bg-zinc-200 dark:bg-zinc-800 rounded-[18px] animate-pulse mt-6" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mt-2 border-b border-hairline/20 pb-4">
        <div className="flex flex-col gap-1.5 cursor-default">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text-graphite">
            <Link href="/" className="hover:text-text-primary hover:underline">Dashboard</Link>
            <span className="opacity-40">/</span>
            <span className="text-blue-accent font-bold">Overview</span>
          </div>
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight leading-none mt-0.5">
            Good afternoon, Alok Singh
          </h1>
        </div>

        {/* Global Reactivity Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-fog rounded-full px-3 py-1.5 border border-hairline/50 text-[11px] font-bold text-text-graphite mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Interactive Filters:</span>
          </div>

          <select
            value={timeRangeFilter}
            onChange={(e) => setTimeRangeFilter(e.target.value)}
            className="bg-card text-text-primary rounded-full border border-hairline px-3 py-1.5 text-[11.5px] font-semibold focus:outline-none focus:border-blue-accent transition-all cursor-pointer hover:bg-fog/50"
          >
            <option value="7days">Last 7 Days</option>
            <option value="14days">Last 14 Days</option>
            <option value="30days">Last Month</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-card text-text-primary rounded-full border border-hairline px-3 py-1.5 text-[11.5px] font-semibold focus:outline-none focus:border-blue-accent transition-all cursor-pointer hover:bg-fog/50"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Security">Security</option>
            <option value="Operations">Operations</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-card text-text-primary rounded-full border border-hairline px-3 py-1.5 text-[11.5px] font-semibold focus:outline-none focus:border-blue-accent transition-all cursor-pointer hover:bg-fog/50"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <div className="relative">
            <Button 
              variant="outline" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 py-1.5 px-4 rounded-full text-[11.5px] font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-36 bg-card border border-hairline rounded-xl shadow-lg z-50 p-1">
                  <button 
                    onClick={handleExportJSON}
                    className="w-full text-left px-3 py-2 text-[12px] font-semibold text-text-primary hover:bg-fog rounded-lg transition-colors cursor-pointer"
                  >
                    Export to JSON
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="w-full text-left px-3 py-2 text-[12px] font-semibold text-text-primary hover:bg-fog rounded-lg transition-colors cursor-pointer"
                  >
                    Export to CSV
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Metrics Grid with Sparklines - Reduced Gap from gap-6 to gap-4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <Card 
          className="hover:border-blue-accent/25 transition-all"
          title="Active Directory size • +10% growth vs last month"
        >
          <div className="flex flex-col gap-1 cursor-default">
            <span className="text-[11.5px] text-text-graphite font-bold uppercase tracking-wider">Total Employees</span>
            <div className="flex items-end justify-between mt-3">
              <span className="text-[44px] font-bold text-blue-accent tracking-tight leading-none">
                <AnimatedNumber value={deptFilter === 'all' ? employees.length : employees.filter(e => e.department === deptFilter).length} />
              </span>
              <Sparkline metric="employees" />
            </div>
            <span className="text-[11px] text-text-graphite mt-3 flex items-center gap-1">
              <span className="text-green-600 dark:text-green-400 font-semibold">↑ 10%</span> vs last month
            </span>
          </div>
        </Card>

        <Card 
          className="hover:border-orange-500/25 transition-all"
          title="Outstanding assignments workload • +12% increase vs last week"
        >
          <div className="flex flex-col gap-1 cursor-default">
            <span className="text-[11.5px] text-text-graphite font-bold uppercase tracking-wider">Active Tasks</span>
            <div className="flex items-end justify-between mt-3">
              <span className="text-[44px] font-bold text-orange-500 tracking-tight leading-none">
                <AnimatedNumber value={metrics.activeTasks} />
              </span>
              <Sparkline metric="active" />
            </div>
            <span className="text-[11px] text-text-graphite mt-3 flex items-center gap-1">
              <span className="text-green-600 dark:text-green-400 font-semibold">↑ 12%</span> vs last week
            </span>
          </div>
        </Card>

        <Card 
          className="hover:border-red-600/25 transition-all"
          title="Triage bottlenecks queue • -8% reduction vs last sprint"
        >
          <div className="flex flex-col gap-1 cursor-default">
            <span className="text-[11.5px] text-text-graphite font-bold uppercase tracking-wider">Overdue Tasks</span>
            <div className="flex items-end justify-between mt-3">
              <span className={`text-[44px] font-bold tracking-tight leading-none ${metrics.overdueTasks > 0 ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}>
                <AnimatedNumber value={metrics.overdueTasks} />
              </span>
              <Sparkline metric="overdue" />
            </div>
            <span className="text-[11px] text-text-graphite mt-3 flex items-center gap-1">
              <span className={metrics.overdueTasks > 0 ? "text-red-500 font-semibold" : "text-green-600 dark:text-green-400 font-semibold"}>
                {metrics.overdueTasks > 0 ? "↑ 5%" : "↓ 8%"}
              </span> vs last sprint
            </span>
          </div>
        </Card>

        <Card 
          className="hover:border-green-600/25 transition-all"
          title="Workforce sprint velocity health • +4% gain vs last sprint"
        >
          <div className="flex flex-col gap-1 cursor-default">
            <span className="text-[11.5px] text-text-graphite font-bold uppercase tracking-wider">Completion Rate</span>
            <div className="flex items-end justify-between mt-3">
              <span className="text-[44px] font-bold text-green-600 dark:text-green-400 tracking-tight leading-none">
                <AnimatedNumber value={metrics.completionRate} />%
              </span>
              <Sparkline metric="rate" />
            </div>
            <span className="text-[11px] text-text-graphite mt-3 flex items-center gap-1">
              <span className="text-green-600 dark:text-green-400 font-semibold">↑ 4%</span> vs last sprint
            </span>
          </div>
        </Card>
      </div>

      {/* Main Analytics: Chart & Donut Layout - Shrunk mt-6 to mt-4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
        {/* Main Analytics Trend Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between min-h-[460px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex flex-col gap-0.5 cursor-default">
              <h3 className="text-[16px] font-bold text-text-primary">Performance Analytics</h3>
              <span className="text-[12.5px] text-text-graphite">Rolling completion history trends</span>
            </div>

            {/* Controls: Line/Bar & Toggle Views */}
            <div className="flex items-center gap-4 bg-fog rounded-lg p-1 border border-hairline/20">
              <div className="flex items-center gap-1.5 border-r border-hairline/35 pr-2 mr-1">
                <button
                  onClick={() => setActiveAnalytics('completions')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    activeAnalytics === 'completions' ? 'bg-card text-text-primary shadow-xs' : 'text-text-graphite hover:text-text-primary'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setActiveAnalytics('productivity')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    activeAnalytics === 'productivity' ? 'bg-card text-text-primary shadow-xs' : 'text-text-graphite hover:text-text-primary'
                  }`}
                >
                  Productivity
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    chartType === 'line' ? 'bg-card text-text-primary shadow-xs' : 'text-text-graphite hover:text-text-primary'
                  }`}
                  title="Line View"
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    chartType === 'bar' ? 'bg-card text-text-primary shadow-xs' : 'text-text-graphite hover:text-text-primary'
                  }`}
                  title="Bar View"
                >
                  Bar
                </button>
              </div>
            </div>
          </div>

          {/* Line & Bar Chart with bottom margin increased to 12px to push legend */}
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--hairline)" opacity={0.2} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-graphite)', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--text-graphite)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--hairline)', borderRadius: '12px', fontSize: '12.5px', color: 'var(--text-primary)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  
                  {activeAnalytics === 'completions' ? (
                    <>
                      {!hiddenDepts['Engineering'] && <Line type="monotone" dataKey="Engineering" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#2563eb' }} />}
                      {!hiddenDepts['Product'] && <Line type="monotone" dataKey="Product" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#16a34a' }} />}
                      {!hiddenDepts['Security'] && <Line type="monotone" dataKey="Security" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#ea580c' }} />}
                      {!hiddenDepts['Operations'] && <Line type="monotone" dataKey="Operations" stroke="#9333ea" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#9333ea' }} />}
                    </>
                  ) : (
                    <Line type="monotone" dataKey="Productivity" stroke="var(--blue-acc)" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: 'var(--blue-acc)' }} />
                  )}
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--hairline)" opacity={0.2} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-graphite)', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--text-graphite)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--hairline)', borderRadius: '12px', fontSize: '12.5px', color: 'var(--text-primary)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  
                  {activeAnalytics === 'completions' ? (
                    <>
                      {!hiddenDepts['Engineering'] && <Bar dataKey="Engineering" fill="#2563eb" radius={[4, 4, 0, 0]} />}
                      {!hiddenDepts['Product'] && <Bar dataKey="Product" fill="#16a34a" radius={[4, 4, 0, 0]} />}
                      {!hiddenDepts['Security'] && <Bar dataKey="Security" fill="#ea580c" radius={[4, 4, 0, 0]} />}
                      {!hiddenDepts['Operations'] && <Bar dataKey="Operations" fill="#9333ea" radius={[4, 4, 0, 0]} />}
                    </>
                  ) : (
                    <Bar dataKey="Productivity" fill="var(--blue-acc)" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Interactive Legends */}
          <div className="flex flex-wrap items-center gap-5 mt-6 pl-2 cursor-default select-none">
            {activeAnalytics === 'completions' ? (
              <>
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${hiddenDepts['Engineering'] ? 'opacity-35' : 'opacity-100'}`}
                  onClick={() => toggleDeptLine('Engineering')}
                >
                  <span className="w-3.5 h-1.5 bg-[#2563eb] rounded-xs" />
                  <span className="text-[11px] text-text-ash font-semibold hover:text-blue-accent">Engineering</span>
                </div>
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${hiddenDepts['Product'] ? 'opacity-35' : 'opacity-100'}`}
                  onClick={() => toggleDeptLine('Product')}
                >
                  <span className="w-3.5 h-1.5 bg-[#16a34a] rounded-xs" />
                  <span className="text-[11px] text-text-ash font-semibold hover:text-green-600">Product</span>
                </div>
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${hiddenDepts['Security'] ? 'opacity-35' : 'opacity-100'}`}
                  onClick={() => toggleDeptLine('Security')}
                >
                  <span className="w-3.5 h-1.5 bg-[#ea580c] rounded-xs" />
                  <span className="text-[11px] text-text-ash font-semibold hover:text-orange-500">Security</span>
                </div>
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${hiddenDepts['Operations'] ? 'opacity-35' : 'opacity-100'}`}
                  onClick={() => toggleDeptLine('Operations')}
                >
                  <span className="w-3.5 h-1.5 bg-[#9333ea] rounded-xs" />
                  <span className="text-[11px] text-text-ash font-semibold hover:text-purple-600">Operations</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 bg-[#2563eb] rounded-xs" />
                <span className="text-[11px] text-text-ash font-semibold">Completion % Score</span>
              </div>
            )}
          </div>
        </Card>

        {/* Task Distribution Donut with Slice highlighting */}
        <Card className="flex flex-col justify-between min-h-[460px]">
          <div className="flex flex-col gap-0.5 cursor-default">
            <h3 className="text-[16px] font-bold text-text-primary">Status Distribution</h3>
            <span className="text-[12.5px] text-text-graphite">Filtered task status ratios</span>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--hairline)', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      color: 'var(--text-primary)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                    }}
                    formatter={(value: any, name: any) => {
                      const total = filteredTasks.length;
                      const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                      return [`${value} Tasks (${percent}%)`, name];
                    }}
                  />
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {donutData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.55}
                        style={{ 
                          transform: activePieIndex === index ? 'scale(1.03)' : 'scale(1)', 
                          transformOrigin: 'center', 
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-[12px] text-text-graphite">No active scopes found.</span>
            )}
            <div className="absolute flex flex-col items-center justify-center cursor-default">
              <span className="text-[28px] font-bold text-text-primary">{filteredTasks.length}</span>
              <span className="text-[10px] uppercase font-bold text-text-graphite tracking-wider">Total Tasks</span>
            </div>
          </div>

          {/* Donut Indicators */}
          <div className="flex flex-col gap-2 pt-3 border-t border-hairline/25">
            {donutData.map((d, index) => (
              <div 
                key={d.name} 
                className={`flex items-center justify-between text-[12px] cursor-default px-1 transition-all ${
                  activePieIndex === index ? 'translate-x-1.5' : ''
                }`}
                onMouseEnter={() => setActivePieIndex(index)}
                onMouseLeave={() => setActivePieIndex(null)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className={`font-semibold transition-colors ${activePieIndex === index ? 'text-blue-accent' : 'text-text-ash'}`}>{d.name}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  <span>{d.value}</span>
                  <span className="text-[11px] text-text-graphite font-normal">
                    ({filteredTasks.length > 0 ? Math.round((d.value / filteredTasks.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Secondary Dashboard Row: Performance, Priority, Gauge & utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        
        {/* Department Performance */}
        <Card className="!p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 cursor-default border-b border-hairline/20 pb-3 mb-3.5">
            <Briefcase className="w-4 h-4 text-text-graphite" />
            <h3 className="text-[15px] font-bold text-text-primary">Department Performance</h3>
          </div>
          
          <div className="flex-1 flex flex-col gap-3.5">
            {departmentsList.map(dept => {
              const score = getDeptPerformance(dept);
              const barColor = 
                dept === 'Engineering' ? 'bg-blue-600' :
                dept === 'Product' ? 'bg-green-600' :
                dept === 'Security' ? 'bg-orange-500' :
                'bg-purple-600';
              
              return (
                <div key={dept} className="flex flex-col gap-1 cursor-default">
                  <div className="flex justify-between text-[12px] font-semibold text-text-primary items-center">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${barColor}`} />
                      <span>{dept}</span>
                    </div>
                    <span>{score}%</span>
                  </div>
                  <div className="w-full bg-fog h-2 rounded-full overflow-hidden border border-hairline/10">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${score}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card className="!p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 cursor-default border-b border-hairline/20 pb-3 mb-3.5">
            <Flame className="w-4 h-4 text-text-graphite" />
            <h3 className="text-[15px] font-bold text-text-primary">Priority Distribution</h3>
          </div>

          <div className="flex-1 flex flex-col justify-around gap-2.5">
            {([
              { key: 'high', label: 'High Priority', color: 'bg-red-500' },
              { key: 'medium', label: 'Medium Priority', color: 'bg-orange-500' },
              { key: 'low', label: 'Low Priority', color: 'bg-green-500' }
            ] as const).map(p => {
              const count = filteredTasks.filter(t => t.priority === p.key && t.status !== 'done').length;
              const maxCount = Math.max(1, filteredTasks.filter(t => t.status !== 'done').length);
              const percent = Math.round((count / maxCount) * 100);
              
              const blockStr = '■'.repeat(Math.max(1, Math.min(10, count))) || 'None';
              
              return (
                <div key={p.key} className="flex items-center justify-between gap-4 cursor-default">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12.5px] font-bold text-text-primary">{p.label}</span>
                    <span className="text-[12px] text-blue-accent font-semibold font-mono tracking-wider">{blockStr}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[13px] font-bold text-text-primary">{count} active</span>
                    <span className="text-[9.5px] text-text-graphite font-semibold">{percent}% of load</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Productivity Gauge & Utilization */}
        <Card className="!p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 cursor-default border-b border-hairline/20 pb-3 mb-3.5">
            <Award className="w-4 h-4 text-text-graphite" />
            <h3 className="text-[15px] font-bold text-text-primary">Overall Health & Lead</h3>
          </div>

          <div className="flex-1 flex items-center justify-between gap-3">
            {/* Inline SVG Circular Gauge - Shrunk 16% */}
            <div className="relative flex items-center justify-center w-20 h-20 cursor-default">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="var(--hairline)" strokeWidth="5" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="34" 
                  stroke="#16a34a" 
                  strokeWidth="5" 
                  fill="transparent" 
                  strokeDasharray={213.6} 
                  strokeDashoffset={213.6 - (213.6 * metrics.completionRate) / 100} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[17px] font-bold text-text-primary">{metrics.completionRate}%</span>
                <span className="text-[7.5px] uppercase font-bold text-text-graphite tracking-wider">Health</span>
              </div>
            </div>

            {/* Leaderboard contributors */}
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-[10.5px] font-bold text-text-graphite uppercase tracking-wider block mb-0.5">Top Contributors</span>
              {leaderboardData.map((leader, i) => (
                <div key={i} className="flex items-center justify-between text-[11.5px] cursor-default py-0.5">
                  <div className="flex items-center gap-2 truncate max-w-[125px]">
                    <img src={leader.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-hairline/35 shadow-xs" />
                    <span className="font-semibold text-text-primary truncate">{leader.name.split(' ')[0]}</span>
                  </div>
                  <span className="font-bold text-text-ash">{leader.count} done</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Tertiary Dashboard Row: Heatmap, Deadlines, Grouped Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        {/* Heatmap Activity */}
        <Card className="!p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-hairline/20 pb-3 mb-3.5">
            <div className="flex items-center gap-2 cursor-default">
              <CalendarDays className="w-4.5 h-4.5 text-text-graphite" />
              <h3 className="text-[15px] font-bold text-text-primary">Weekday Load</h3>
            </div>
            <span className="text-[10.5px] font-bold text-text-graphite">Activity by Weekday</span>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-2 pr-1">
            {weekdayData.map(({ day, count }) => {
              const maxCount = Math.max(1, Math.max(...weekdays.map((_, i) => getWeekdayActivity(i))));
              const fillRatio = (count / maxCount) * 100;
              return (
                <div key={day} className="flex items-center gap-3 cursor-default py-0.5">
                  <span className="text-[11.5px] font-bold text-text-graphite w-8">{day}</span>
                  <div className="flex-1 bg-fog h-5 rounded-[6px] overflow-hidden relative border border-hairline/5">
                    <div 
                      className="bg-blue-accent/35 dark:bg-blue-accent/25 h-full rounded-[6px] transition-all" 
                      style={{ width: `${fillRatio}%` }} 
                    />
                    <span className="absolute inset-y-0 left-2.5 flex items-center text-[10.5px] font-bold text-text-primary">
                      {count} {count === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Deadlines with Urgency Coloring */}
        <Card className="!p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 cursor-default border-b border-hairline/20 pb-3 mb-3.5">
            <AlertCircle className="w-4.5 h-4.5 text-red-500" />
            <h3 className="text-[15px] font-bold text-text-primary">Upcoming Deadlines</h3>
          </div>

          <div className="flex-1 flex flex-col gap-2.5">
            {upcomingDeadlines.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[12px] text-text-graphite py-6">
                No active upcoming limits.
              </div>
            ) : (
              upcomingDeadlines.map((task) => {
                const assignee = employees.find(e => e.id === task.assigneeId);
                const isOverdue = task.dueDate && isPastDate(task.dueDate);
                
                return (
                  <div 
                    key={task.id} 
                    onClick={() => router.push(`/tasks?search=${encodeURIComponent(task.title)}`)}
                    className="flex flex-col gap-1 p-2.5 bg-fog/30 border border-hairline/35 rounded-xl hover:bg-fog/50 transition-colors cursor-pointer hover:border-blue-accent/20"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[12.5px] font-bold text-text-primary truncate max-w-[145px]">{task.title}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isOverdue 
                          ? 'bg-red-500/10 border-red-500/30 text-red-600' 
                          : 'bg-orange-500/10 border-orange-500/30 text-orange-600'
                      }`}>
                        {isOverdue ? '🔴 Overdue' : '⏳ Due Soon'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] text-text-graphite pt-1">
                      <div className="flex items-center gap-1.5">
                        {assignee && <img src={assignee.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />}
                        <span>{assignee ? assignee.name.split(' ')[0] : 'Someone'}</span>
                      </div>
                      <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Grouped Activity Logs with clickable row logic */}
        <Card className="!p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 cursor-default border-b border-hairline/20 pb-3 mb-3.5">
            <Clock className="w-4.5 h-4.5 text-text-graphite" />
            <h3 className="text-[15px] font-bold text-text-primary">Recent Logs</h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[190px] pr-1 scroller">
            {events.length === 0 ? (
              <div className="text-[12.5px] text-text-graphite py-6 text-center">
                No active log events.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Today */}
                {groupedEvents.today.length > 0 && (
                  <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                    <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider block border-b border-hairline/15 pb-1 select-none">Today</span>
                    {groupedEvents.today.map(evt => (
                      <div 
                        key={evt.id} 
                        onClick={() => handleLogClick(evt)}
                        className="flex items-start gap-2.5 text-[12px] cursor-pointer hover:bg-fog/45 p-1 rounded-md transition-all hover:translate-x-1"
                      >
                        <div className="mt-0.5">{getActivityIcon(evt.type)}</div>
                        <span className="text-text-primary leading-tight font-medium hover:text-blue-accent transition-colors">{evt.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Yesterday */}
                {groupedEvents.yesterday.length > 0 && (
                  <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                    <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider block border-b border-hairline/15 pb-1 select-none">Yesterday</span>
                    {groupedEvents.yesterday.map(evt => (
                      <div 
                        key={evt.id} 
                        onClick={() => handleLogClick(evt)}
                        className="flex items-start gap-2.5 text-[12px] cursor-pointer hover:bg-fog/45 p-1 rounded-md transition-all hover:translate-x-1"
                      >
                        <div className="mt-0.5">{getActivityIcon(evt.type)}</div>
                        <span className="text-text-primary leading-tight font-medium hover:text-blue-accent transition-colors">{evt.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Earlier */}
                {groupedEvents.earlier.length > 0 && (
                  <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                    <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider block border-b border-hairline/15 pb-1 select-none">Earlier</span>
                    {groupedEvents.earlier.slice(0, 3).map(evt => (
                      <div 
                        key={evt.id} 
                        onClick={() => handleLogClick(evt)}
                        className="flex items-start gap-2.5 text-[12px] cursor-pointer hover:bg-fog/45 p-1 rounded-md transition-all hover:translate-x-1"
                      >
                        <div className="mt-0.5">{getActivityIcon(evt.type)}</div>
                        <span className="text-text-primary leading-tight font-medium hover:text-blue-accent transition-colors">{evt.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

    </PageWrapper>
  );
}
