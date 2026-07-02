"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppData } from '../../context/AppDataContext';
import { useDebounce } from '../../hooks/useDebounce';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { 
  Search, 
  UserPlus, 
  SlidersHorizontal, 
  UserX, 
  Mail, 
  Phone, 
  CircleDot, 
  X, 
  ExternalLink, 
  Download, 
  UserCheck, 
  Briefcase, 
  Percent, 
  Users, 
  Plus
} from 'lucide-react';
import { Status, Employee, Task } from '../../types';

function EmployeesPageInner() {
  const { employees, tasks, addEmployee } = useAppData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQueryParam = searchParams ? searchParams.get('search') : '';
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Employee for Detail Drawer
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Sync Search from URL param
  useEffect(() => {
    if (searchQueryParam) {
      setSearch(searchQueryParam);
    }
  }, [searchQueryParam]);

  // Modal State for Add Employee
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: '',
    department: 'Engineering',
    status: 'active' as Status,
    avatarUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Departments List
  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Product', label: 'Product' },
    { value: 'Design', label: 'Design' },
    { value: 'Security', label: 'Security' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Analytics', label: 'Analytics' }
  ];

  // Statuses List
  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'on-leave', label: 'On Leave' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Get active and completed task counts for an employee
  const getEmployeeTaskStats = useCallback((employeeId: string) => {
    const empTasks = tasks.filter(t => t.assigneeId === employeeId);
    const activeTasks = empTasks.filter(t => t.status !== 'done');
    const completedTasks = empTasks.filter(t => t.status === 'done');
    
    // Workload calculation: 5 active tasks = 100% capacity
    const workloadPercent = Math.min(100, Math.round((activeTasks.length / 5) * 100));
    
    let workloadStatus: 'available' | 'moderate' | 'busy' = 'available';
    if (workloadPercent >= 80) workloadStatus = 'busy';
    else if (workloadPercent >= 40) workloadStatus = 'moderate';

    return {
      total: empTasks.length,
      active: activeTasks.length,
      completed: completedTasks.length,
      workload: workloadPercent,
      status: workloadStatus,
      rawTasks: empTasks
    };
  }, [tasks]);

  const taskStatsMap = useMemo(() => {
    const map = new Map();
    employees.forEach(emp => {
      map.set(emp.id, getEmployeeTaskStats(emp.id));
    });
    return map;
  }, [employees, getEmployeeTaskStats]);

  // Filter & Sort Employees
  const filteredAndSortedEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const email = `${emp.name.toLowerCase().replace(/\s+/g, '.')}@meridian.com`;
        const matchesSearch = 
          emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
          emp.role.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          emp.department.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          email.toLowerCase().includes(debouncedSearch.toLowerCase());
          
        const matchesDept = department === 'all' || emp.department === department;
        const matchesStatus = status === 'all' || emp.status === status;
        return matchesSearch && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        const aStats = taskStatsMap.get(a.id) || { workload: 0 };
        const bStats = taskStatsMap.get(b.id) || { workload: 0 };

        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name-desc') {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === 'dept') {
          return a.department.localeCompare(b.department);
        }
        if (sortBy === 'workload-desc') {
          return bStats.workload - aStats.workload;
        }
        if (sortBy === 'workload-asc') {
          return aStats.workload - bStats.workload;
        }
        return 0;
      });
  }, [employees, debouncedSearch, department, status, sortBy, taskStatsMap]);

  // Pagination Helper
  const totalItems = filteredAndSortedEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = useMemo(() => filteredAndSortedEmployees.slice(startIndex, startIndex + itemsPerPage), [filteredAndSortedEmployees, startIndex, itemsPerPage]);

  useEffect(() => {
    // Reset page if filters change
    setCurrentPage(1);
  }, [debouncedSearch, department, status, sortBy]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setDepartment('all');
    setStatus('all');
    setSortBy('name-asc');
  }, []);

  // Summary Metrics calculations
  const summaryMetrics = useMemo(() => {
    const totalEmployees = employees.length;
    const activeCount = employees.filter(e => e.status === 'active').length;
    const leaveCount = employees.filter(e => e.status === 'on-leave').length;
    const deptCount = new Set(employees.map(e => e.department)).size;
    return { totalEmployees, activeCount, leaveCount, deptCount };
  }, [employees]);

  const { totalEmployees, activeCount, leaveCount, deptCount } = summaryMetrics;

  // Department distribution calculation for small chart
  const deptDistribution = useMemo(() => {
    return departments
      .filter(d => d.value !== 'all')
      .map(d => {
        const count = employees.filter(e => e.department === d.value).length;
        return { dept: d.value, count };
      })
      .sort((a, b) => b.count - a.count);
  }, [employees, departments]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!newEmp.name.trim()) newErrors.name = 'Name is required';
    if (!newEmp.role.trim()) newErrors.role = 'Role/Title is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const avatarNum = Math.floor(Math.random() * 70) + 1;
    const finalAvatar = newEmp.avatarUrl.trim() || `https://i.pravatar.cc/150?img=${avatarNum}`;

    addEmployee({
      name: newEmp.name,
      role: newEmp.role,
      department: newEmp.department,
      status: newEmp.status,
      avatarUrl: finalAvatar
    });

    setNewEmp({
      name: '',
      role: '',
      department: 'Engineering',
      status: 'active',
      avatarUrl: ''
    });
    setErrors({});
    setIsModalOpen(false);
    triggerToast("Employee added successfully!");
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = 'ID,Name,Role,Department,Status,Email\n';
    const rows = employees.map(emp => {
      const email = `${emp.name.toLowerCase().replace(/\s+/g, '.')}@meridian.com`;
      return `"${emp.id}","${emp.name}","${emp.role}","${emp.department}","${emp.status}","${email}"`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `employees_directory_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    triggerToast("CSV export initiated!");
  };

  // Department Badges color map
  const getDeptColorClass = (dept: string) => {
    const map: Record<string, string> = {
      Engineering: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
      Product:     'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300',
      Design:      'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-300',
      Security:    'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
      Operations:  'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300',
      Marketing:   'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300',
      Analytics:   'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300'
    };
    return map[dept] ?? 'bg-fog border-hairline text-text-graphite';
  };

  return (
    <PageWrapper>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border border-hairline bg-green-50 text-green-800 dark:bg-green-950/60 dark:text-green-300 text-[13px] font-semibold">
            <UserCheck className="w-4 h-4" />
            {toast}
          </div>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] uppercase tracking-widest font-bold text-text-graphite cursor-default">
            Organization
          </span>
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight cursor-default">
            Employee Directory
          </h1>
          <span className="text-[13px] text-text-graphite">Monitor resource workloads and assign workspace operations</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="flex items-center gap-2 self-start sm:self-auto hover:bg-fog"
            title="Export full employee database as CSV"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>

          <Button 
            variant="primary" 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <UserPlus className="w-4.5 h-4.5" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Summary Stats Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
        <Card className="!p-4 flex items-center justify-between hover:border-blue-accent/25 transition-all">
          <div className="flex flex-col gap-0.5 cursor-default">
            <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider">Total Members</span>
            <span className="text-[24px] font-bold text-text-primary">{totalEmployees}</span>
          </div>
          <Users className="w-6 h-6 text-blue-500" />
        </Card>
        
        <Card className="!p-4 flex items-center justify-between hover:border-purple-500/25 transition-all">
          <div className="flex flex-col gap-0.5 cursor-default">
            <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider">Active Depts</span>
            <span className="text-[24px] font-bold text-purple-500">{deptCount}</span>
          </div>
          <Briefcase className="w-6 h-6 text-purple-500" />
        </Card>

        <Card className="!p-4 flex items-center justify-between hover:border-emerald-500/25 transition-all">
          <div className="flex flex-col gap-0.5 cursor-default">
            <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider">Available Status</span>
            <span className="text-[24px] font-bold text-emerald-500">{activeCount}</span>
          </div>
          <UserCheck className="w-6 h-6 text-emerald-500" />
        </Card>

        <Card className="!p-4 flex items-center justify-between hover:border-orange-500/25 transition-all">
          <div className="flex flex-col gap-0.5 cursor-default">
            <span className="text-[10px] font-bold text-text-graphite uppercase tracking-wider">On Leave</span>
            <span className="text-[24px] font-bold text-orange-500">{leaveCount}</span>
          </div>
          <CircleDot className="w-6 h-6 text-orange-500" />
        </Card>
      </div>

      {/* Main Layout containing Directory Grid + Sidebar Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-start">
        
        {/* Filters and List - Left Column */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          
          {/* Grouped Filter and Search Panel */}
          <Card className="p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search input field */}
              <div className="relative md:col-span-5 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-text-graphite/60" />
                <input
                  type="text"
                  placeholder="Search by name, role, department, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-fog rounded-[12px] border border-hairline/10 pl-10 pr-4 py-2.5 text-[13px] placeholder-text-graphite/60 text-text-primary focus:outline-none focus:border-blue-accent transition-colors"
                />
              </div>

              {/* Select Filter Group */}
              <div className="md:col-span-7 grid grid-cols-3 gap-2 w-full">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-card text-text-primary rounded-[12px] border border-hairline px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-blue-accent transition-colors cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-card text-text-primary rounded-[12px] border border-hairline px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-blue-accent transition-colors cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-card text-text-primary rounded-[12px] border border-hairline px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-blue-accent transition-colors cursor-pointer"
                >
                  <option value="name-asc">Sort: A-Z</option>
                  <option value="name-desc">Sort: Z-A</option>
                  <option value="dept">Sort: Department</option>
                  <option value="workload-desc">Workload: High → Low</option>
                  <option value="workload-asc">Workload: Low → High</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Directory Cards Grid */}
          {paginatedEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-[16px] border border-hairline py-16 cursor-default">
              <div className="p-4 bg-fog rounded-full mb-4">
                <UserX className="w-8 h-8 text-text-graphite" />
              </div>
              <h3 className="text-[16px] font-semibold text-text-primary mb-1">
                No employees match filters
              </h3>
              <p className="text-[13px] text-text-graphite mb-5 max-w-sm">
                Try adjusting your search query or department selections to discover team listings.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedEmployees.map((emp) => {
                const email = `${emp.name.toLowerCase().replace(/\s+/g, '.')}@meridian.com`;
                const idNum = emp.id.replace('emp-', '');
                
                // Tasks workload details
                const stats = getEmployeeTaskStats(emp.id);

                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="group bg-card rounded-[16px] border border-hairline p-5 hover:border-blue-600/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden"
                  >
                    <div>
                      {/* Top Action Overlay (Hover Only) */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9.5px] font-bold text-blue-accent bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/25 flex items-center gap-1">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      {/* Header Avatar and Primary details */}
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-14 h-14 rounded-full object-cover border border-hairline shadow-sm bg-fog"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}`;
                            }}
                          />
                          <span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-card ${
                            emp.status === 'active' ? 'bg-green-500' :
                            emp.status === 'on-leave' ? 'bg-orange-400' :
                            'bg-zinc-500'
                          }`} title={emp.status} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14.5px] font-bold text-text-primary truncate">
                            {emp.name}
                          </h3>
                          <p className="text-[12px] text-text-ash font-medium truncate mt-0.5">
                            {emp.role}
                          </p>
                          <span className={`text-[9.5px] font-extrabold border px-2 py-0.5 rounded-full mt-2 inline-block ${getDeptColorClass(emp.department)}`}>
                            {emp.department}
                          </span>
                        </div>
                      </div>

                      {/* Stats & Workload bar */}
                      <div className="mt-4 pt-3.5 border-t border-hairline/15">
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-text-graphite font-bold uppercase tracking-wider text-[9px]">Capacity / Workload</span>
                          <span className={`font-bold ${
                            stats.status === 'busy' ? 'text-red-500' :
                            stats.status === 'moderate' ? 'text-indigo-500' :
                            'text-emerald-500'
                          }`}>
                            {stats.workload}% ({stats.active} Active)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-hairline/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              stats.status === 'busy' ? 'bg-red-500' :
                              stats.status === 'moderate' ? 'bg-indigo-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${stats.workload}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Task and Updated markers */}
                    <div className="mt-4 pt-3 border-t border-hairline/15 flex items-center justify-between text-[11px] font-semibold text-text-graphite">
                      <span>Tasks: <strong className="text-text-primary">{stats.total}</strong></span>
                      <span className="text-[9.5px] font-medium opacity-65">
                        {emp.status === 'active' ? '🟢 Active' : emp.status === 'on-leave' ? '🟡 On Leave' : '⚫ Inactive'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Directory Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-hairline/20 pt-4 mt-1 select-none">
              <span className="text-[12px] text-text-graphite">
                Showing <strong className="text-text-primary">{startIndex + 1}</strong> to <strong className="text-text-primary">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong className="text-text-primary">{totalItems}</strong> members
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 text-[11.5px] font-bold h-7"
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded-lg text-[11.5px] font-bold border transition-colors ${
                      currentPage === page
                        ? 'bg-blue-accent text-white border-blue-accent'
                        : 'border-hairline hover:bg-fog text-text-ash'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 text-[11.5px] font-bold h-7"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar distributions - Right Column */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Team Distribution Mini Graph */}
          <Card className="p-4 flex flex-col gap-3">
            <div className="border-b border-hairline/25 pb-2">
              <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-text-primary">
                Team Distribution
              </h3>
              <p className="text-[11px] text-text-graphite">Distribution of workforce size by department</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {deptDistribution.map(d => {
                const percent = totalEmployees > 0 ? Math.round((d.count / totalEmployees) * 100) : 0;
                return (
                  <div 
                    key={d.dept} 
                    className="flex flex-col gap-1 cursor-pointer group"
                    onClick={() => setDepartment(department === d.dept ? 'all' : d.dept)}
                  >
                    <div className="flex justify-between items-center text-[11.5px] font-bold">
                      <span className="text-text-primary group-hover:text-blue-accent transition-colors">{d.dept}</span>
                      <span className="text-text-graphite">{d.count} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-hairline/35 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          d.dept === 'Engineering' ? 'bg-blue-500' :
                          d.dept === 'Product' ? 'bg-purple-500' :
                          d.dept === 'Design' ? 'bg-pink-500' :
                          d.dept === 'Security' ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </div>

      {/* Slide-over Profile Drawer Panel */}
      {selectedEmployee && (
        <>
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200" 
            onClick={() => setSelectedEmployee(null)}
          />
          {/* Sliding drawer card */}
          <div className="fixed right-0 top-0 bottom-0 w-[420px] max-w-full bg-card border-l border-hairline shadow-2xl z-50 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300 text-text-primary">
            
            {/* Header info bar */}
            <div className="flex items-center justify-between border-b border-hairline/25 pb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-graphite">Member Profile</span>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="text-text-graphite hover:text-text-primary p-1 rounded-lg hover:bg-fog transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Detail Card */}
            <div className="flex flex-col items-center text-center mt-6">
              <div className="relative">
                <img 
                  src={selectedEmployee.avatarUrl} 
                  alt="" 
                  className="w-20 h-20 rounded-full border-2 border-blue-accent/25 shadow-md bg-fog object-cover"
                />
                <span className={`absolute bottom-0 right-1 block h-5 w-5 rounded-full border-4 border-card ${
                  selectedEmployee.status === 'active' ? 'bg-green-500' :
                  selectedEmployee.status === 'on-leave' ? 'bg-orange-400' :
                  'bg-zinc-500'
                }`} />
              </div>
              <h2 className="text-[18px] font-extrabold mt-3 tracking-tight">{selectedEmployee.name}</h2>
              <span className="text-[13px] font-medium text-text-ash">{selectedEmployee.role}</span>
              <span className={`text-[10px] font-extrabold border px-2.5 py-0.5 rounded-full mt-2 inline-block ${getDeptColorClass(selectedEmployee.department)}`}>
                {selectedEmployee.department}
              </span>
            </div>

            {/* Workload Statistics details */}
            <div className="mt-8 border-t border-hairline/15 pt-5 flex flex-col gap-4">
              <h3 className="text-[12px] font-extrabold uppercase tracking-wider text-text-graphite mb-1">Resource Capacity</h3>
              
              {(() => {
                const stats = getEmployeeTaskStats(selectedEmployee.id);
                return (
                  <>
                    {/* Workload Meter */}
                    <div className="flex flex-col gap-1.5 bg-fog p-4 rounded-xl border border-hairline/10">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="font-bold text-text-primary">Current Workload</span>
                        <span className={`font-extrabold ${
                          stats.status === 'busy' ? 'text-red-500' :
                          stats.status === 'moderate' ? 'text-indigo-500' :
                          'text-emerald-500'
                        }`}>
                          {stats.workload}% ({stats.active} active tasks)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-hairline/45 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            stats.status === 'busy' ? 'bg-red-500' :
                            stats.status === 'moderate' ? 'bg-indigo-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${stats.workload}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-text-graphite mt-1">
                        {stats.status === 'busy' ? '🔴 Resources are stretched. Consider offloading tasks.' : 
                         stats.status === 'moderate' ? '🟡 Steady capacity load. Can accept minor task lists.' : 
                         '🟢 Ready for assignments. Resource is available.'}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-fog p-3 rounded-lg border border-hairline/10">
                        <span className="text-[16px] font-bold block text-text-primary">{stats.total}</span>
                        <span className="text-[9.5px] font-semibold text-text-graphite uppercase tracking-wide">Total Tasks</span>
                      </div>
                      <div className="bg-fog p-3 rounded-lg border border-hairline/10">
                        <span className="text-[16px] font-bold block text-indigo-500">{stats.active}</span>
                        <span className="text-[9.5px] font-semibold text-text-graphite uppercase tracking-wide">In Progress</span>
                      </div>
                      <div className="bg-fog p-3 rounded-lg border border-hairline/10">
                        <span className="text-[16px] font-bold block text-green-500">{stats.completed}</span>
                        <span className="text-[9.5px] font-semibold text-text-graphite uppercase tracking-wide">Completed</span>
                      </div>
                    </div>

                    {/* Tasks List */}
                    <div className="mt-4 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center border-b border-hairline/15 pb-2">
                        <span className="text-[12px] font-extrabold uppercase tracking-wider text-text-graphite">Workspace Assignments</span>
                        <button
                          onClick={() => {
                            setSelectedEmployee(null);
                            router.push(`/tasks?search=${encodeURIComponent(selectedEmployee.name)}`);
                          }}
                          className="text-[11px] font-bold text-blue-accent hover:underline flex items-center gap-1.5"
                        >
                          Show on Board <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {stats.rawTasks.length === 0 ? (
                        <p className="text-[12px] text-text-graphite italic text-center py-6">No tasks assigned to this operator.</p>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1 scroller scrollbar-thin">
                          {stats.rawTasks.map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => {
                                setSelectedEmployee(null);
                                router.push(`/tasks?search=${encodeURIComponent(t.title)}`);
                              }}
                              className="bg-card hover:bg-fog hover:border-blue-accent/30 border border-hairline rounded-lg p-3 transition-all cursor-pointer flex justify-between items-center gap-3"
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-[12px] font-bold text-text-primary truncate">{t.title}</span>
                                <span className="text-[10px] text-text-graphite">Priority: {t.priority.toUpperCase()}</span>
                              </div>
                              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${
                                t.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                                t.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-zinc-50 text-zinc-700 border-zinc-200'
                              }`}>
                                {t.status.replace('-', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Quick Actions at the bottom */}
            <div className="mt-auto pt-6 border-t border-hairline/25">
              <Button 
                variant="primary" 
                onClick={() => {
                  setSelectedEmployee(null);
                  router.push(`/tasks?search=${encodeURIComponent(selectedEmployee.name)}`);
                }}
                className="w-full flex items-center justify-center gap-2"
              >
                Go to Tasks Page
              </Button>
            </div>

          </div>
        </>
      )}

      {/* Add Employee Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={newEmp.name}
            onChange={(e) => {
              setNewEmp({ ...newEmp, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="e.g. John Doe"
            error={errors.name}
            required
          />

          <Input
            label="Role / Title"
            value={newEmp.role}
            onChange={(e) => {
              setNewEmp({ ...newEmp, role: e.target.value });
              if (errors.role) setErrors({ ...errors, role: '' });
            }}
            placeholder="e.g. Senior Software Engineer"
            error={errors.role}
            required
          />

          <Select
            label="Department"
            options={departments.filter(d => d.value !== 'all')}
            value={newEmp.department}
            onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
          />

          <Select
            label="Status"
            options={statuses.filter(s => s.value !== 'all')}
            value={newEmp.status}
            onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value as Status })}
          />

          <Input
            label="Avatar Image URL (Optional)"
            value={newEmp.avatarUrl}
            onChange={(e) => setNewEmp({ ...newEmp, avatarUrl: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
          />

          <div className="flex items-center justify-end gap-3 mt-6 border-t border-hairline/25 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-graphite font-semibold">Loading directory...</div>}>
      <EmployeesPageInner />
    </Suspense>
  );
}
